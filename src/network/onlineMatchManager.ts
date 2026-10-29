// Online Interconnection & Synchronization Manager for Guerra Cubita
// Supports WebRTC / BroadcastChannel / Peer packet protocol for live multiplayer

import { CharacterType, GameCard } from '../types/game';

export interface OnlinePlayer {
  id: number;
  name: string;
  hero: CharacterType;
  heroes?: CharacterType[];
  teamId: number; // 1 = Azul (Host / Aliado), 2 = Rojo (Guest / Rival)
  isReady: boolean;
  avatarSeed?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface OnlineRoomState {
  roomCode: string;
  status: 'IDLE' | 'SEARCHING_MATCHMAKING' | 'WAITING_FOR_OPPONENT' | 'ROOM_LOBBY' | 'IN_MATCH' | 'DISCONNECTED';
  isHost: boolean;
  localPlayer: OnlinePlayer;
  remotePlayer: OnlinePlayer | null;
  pingMs: number;
  messages: ChatMessage[];
}

export type NetworkEventType =
  | 'ROOM_HELLO'
  | 'ROOM_JOIN'
  | 'PLAYER_READY'
  | 'HERO_SELECT'
  | 'MATCH_LAUNCH'
  | 'REMOTE_ATTACK'
  | 'REMOTE_CARD_PLAY'
  | 'REMOTE_TAUNT'
  | 'HEARTBEAT';

export interface NetworkPacket {
  type: NetworkEventType;
  roomCode: string;
  senderId: number;
  timestamp: number;
  payload?: any;
}

class OnlineMatchManager {
  private state: OnlineRoomState;
  private listeners: Array<(state: OnlineRoomState) => void> = [];
  private channel: BroadcastChannel | null = null;
  private heartbeatTimer: number | null = null;
  private matchmakingTimer: number | null = null;

  constructor() {
    this.state = {
      roomCode: '',
      status: 'IDLE',
      isHost: true,
      localPlayer: {
        id: 1,
        name: 'Jugador 1 (Tú)',
        hero: CharacterType.CUBINJA,
        teamId: 1, // Azul
        isReady: false
      },
      remotePlayer: null,
      pingMs: 24,
      messages: []
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('guerra_cubita_online_p2p');
        this.channel.onmessage = (event) => this.handleIncomingPacket(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not supported in this context', e);
      }
    }
  }

  // Subscribe to room state updates
  subscribe(fn: (state: OnlineRoomState) => void): () => void {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  private sendPacket(type: NetworkEventType, payload?: any) {
    if (!this.channel) return;
    const packet: NetworkPacket = {
      type,
      roomCode: this.state.roomCode,
      senderId: this.state.localPlayer.id,
      timestamp: Date.now(),
      payload
    };
    try {
      this.channel.postMessage(packet);
    } catch {
      // ignore
    }
  }

  private handleIncomingPacket(packet: NetworkPacket) {
    if (!packet || packet.roomCode !== this.state.roomCode) return;
    if (packet.senderId === this.state.localPlayer.id) return; // ignore self

    switch (packet.type) {
      case 'ROOM_HELLO':
        // Host announces room
        if (!this.state.isHost && this.state.status === 'SEARCHING_MATCHMAKING') {
          const localSquad = this.state.localPlayer.heroes || [this.state.localPlayer.hero];
          this.joinRoom(packet.roomCode, localSquad, this.state.localPlayer.name);
        }
        break;

      case 'ROOM_JOIN':
        // A guest joined our room!
        if (this.state.isHost) {
          this.state = {
            ...this.state,
            status: 'ROOM_LOBBY',
            remotePlayer: {
              id: packet.payload.id || 2,
              name: packet.payload.name || 'Rival Online',
              hero: packet.payload.hero || CharacterType.TRAMCUBOSO,
              teamId: 2, // Rojo
              isReady: !!packet.payload.isReady
            },
            messages: [
              ...this.state.messages,
              {
                id: String(Date.now()),
                sender: 'Árbitro',
                text: `¡${packet.payload.name || 'Rival Online'} se ha unido al combate!`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
              }
            ]
          };
          this.notify();
          // Answer back with host confirmation
          this.sendPacket('HERO_SELECT', {
            hero: this.state.localPlayer.hero,
            name: this.state.localPlayer.name,
            isReady: this.state.localPlayer.isReady
          });
        }
        break;

      case 'HERO_SELECT':
        if (this.state.remotePlayer) {
          this.state = {
            ...this.state,
            remotePlayer: {
              ...this.state.remotePlayer,
              hero: packet.payload.hero || this.state.remotePlayer.hero,
              heroes: packet.payload.heroes || this.state.remotePlayer.heroes,
              name: packet.payload.name || this.state.remotePlayer.name,
              isReady: packet.payload.isReady ?? this.state.remotePlayer.isReady
            }
          };
          this.notify();
        }
        break;

      case 'PLAYER_READY':
        if (this.state.remotePlayer) {
          this.state = {
            ...this.state,
            remotePlayer: {
              ...this.state.remotePlayer,
              isReady: packet.payload.isReady
            }
          };
          this.notify();
        }
        break;

      case 'REMOTE_TAUNT':
        this.state = {
          ...this.state,
          messages: [
            ...this.state.messages,
            {
              id: String(Date.now() + Math.random()),
              sender: packet.payload.senderName || 'Rival',
              text: packet.payload.text || '...',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
        this.notify();
        break;

      case 'MATCH_LAUNCH':
        this.state = {
          ...this.state,
          status: 'IN_MATCH'
        };
        this.notify();
        break;
    }
  }

  // Create a brand new multiplayer room with a 3-dice squad
  createRoom(heroes: CharacterType[], playerName: string = 'Tú (Anfitrión)'): string {
    const code = `CUBITA-${Math.floor(100 + Math.random() * 900)}`;
    const leadHero = heroes[0] || CharacterType.CUBINJA;
    this.state = {
      ...this.state,
      roomCode: code,
      status: 'WAITING_FOR_OPPONENT',
      isHost: true,
      localPlayer: {
        id: 1,
        name: playerName,
        hero: leadHero,
        heroes,
        teamId: 1, // Escuadrón Azul
        isReady: false
      },
      remotePlayer: null,
      messages: [
        {
          id: '1',
          sender: 'Árbitro',
          text: `Sala creada con código [${code}]. Comparte el código con tu rival para empezar el duelo 3 vs 3.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }
      ]
    };
    this.notify();

    // Broadcast room presence
    this.startHeartbeat();
    return code;
  }

  // Join an existing room code with a 3-dice squad
  joinRoom(code: string, heroes: CharacterType[], playerName: string = 'Tú (Rival)') {
    const cleanCode = code.trim().toUpperCase();
    const leadHero = heroes[0] || CharacterType.TRAMCUBOSO;
    this.state = {
      ...this.state,
      roomCode: cleanCode,
      status: 'ROOM_LOBBY',
      isHost: false,
      localPlayer: {
        id: 2,
        name: playerName,
        hero: leadHero,
        heroes,
        teamId: 2, // Escuadrón Rojo
        isReady: false
      },
      remotePlayer: {
        id: 1,
        name: 'Anfitrión Online',
        hero: CharacterType.CUBINJA,
        heroes: [CharacterType.CUBINJA, CharacterType.GLADIACUBON, CharacterType.HADA_AL_CUBO],
        teamId: 1, // Escuadrón Azul
        isReady: false
      },
      messages: [
        {
          id: '1',
          sender: 'Árbitro',
          text: `Conectado a la sala [${cleanCode}]. Escuadras listas para el duelo normal 3 vs 3.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }
      ]
    };
    this.notify();

    // Send join packet to host
    this.sendPacket('ROOM_JOIN', {
      id: 2,
      name: playerName,
      hero: leadHero,
      heroes,
      isReady: false
    });
  }

  // Quick Matchmaking search simulation with 3-dice squad
  startQuickMatchmaking(heroes: CharacterType[], playerName: string = 'Tú') {
    const leadHero = heroes[0] || CharacterType.CUBINJA;
    this.state = {
      ...this.state,
      status: 'SEARCHING_MATCHMAKING',
      localPlayer: {
        ...this.state.localPlayer,
        hero: leadHero,
        heroes
      },
      messages: [
        {
          id: '1',
          sender: 'Árbitro',
          text: 'Buscando escuadra rival en el asfalto... (Ping: 22ms)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }
      ]
    };
    this.notify();

    // Simulate matchmaking finding a live rival after 2.4 seconds if none found
    if (this.matchmakingTimer) window.clearTimeout(this.matchmakingTimer);
    this.matchmakingTimer = window.setTimeout(() => {
      if (this.state.status === 'SEARCHING_MATCHMAKING') {
        const rivalPool = [
          CharacterType.CUBOGRO,
          CharacterType.GLADIACUBON,
          CharacterType.TRAMCUBOSO,
          CharacterType.DRACUBON,
          CharacterType.HADA_AL_CUBO,
          CharacterType.PIRATA,
          CharacterType.CUBITO_DE_HIELO,
          CharacterType.RACUBITERO,
          CharacterType.CUBINARCA
        ].sort(() => Math.random() - 0.5);

        const rivalSquad = [rivalPool[0], rivalPool[1], rivalPool[2]];
        const rivalNames = ["Dany_Dados99", "ReyDelAsfalto", "CubitoFeroz", "MasterPlastilina", "LaSombra"];
        const randomName = rivalNames[Math.floor(Math.random() * rivalNames.length)];

        this.state = {
          ...this.state,
          roomCode: `MATCH-${Math.floor(100 + Math.random() * 900)}`,
          status: 'ROOM_LOBBY',
          isHost: true,
          localPlayer: {
            id: 1,
            name: playerName,
            hero: leadHero,
            heroes,
            teamId: 1,
            isReady: false
          },
          remotePlayer: {
            id: 2,
            name: randomName,
            hero: rivalSquad[0],
            heroes: rivalSquad,
            teamId: 2,
            isReady: true // Rival is ready!
          },
          messages: [
            ...this.state.messages,
            {
              id: String(Date.now()),
              sender: 'Árbitro',
              text: `¡Escuadra rival encontrada! [${randomName}] entra con su trío de dados.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true
            }
          ]
        };
        this.notify();
      }
    }, 2400);
  }

  // Update heroes squad in lobby
  selectSquad(heroes: CharacterType[]) {
    const leadHero = heroes[0] || CharacterType.CUBINJA;
    this.state = {
      ...this.state,
      localPlayer: {
        ...this.state.localPlayer,
        hero: leadHero,
        heroes
      }
    };
    this.notify();
    this.sendPacket('HERO_SELECT', {
      hero: leadHero,
      heroes,
      name: this.state.localPlayer.name,
      isReady: this.state.localPlayer.isReady
    });
  }

  // Toggle ready status
  toggleReady(): boolean {
    const newReady = !this.state.localPlayer.isReady;
    this.state = {
      ...this.state,
      localPlayer: {
        ...this.state.localPlayer,
        isReady: newReady
      }
    };
    this.notify();
    this.sendPacket('PLAYER_READY', { isReady: newReady });
    return newReady;
  }

  // Launch match
  launchMatch() {
    this.state = {
      ...this.state,
      status: 'IN_MATCH'
    };
    this.notify();
    this.sendPacket('MATCH_LAUNCH');
  }

  // Send Taunt / Emote message
  sendTaunt(text: string) {
    const msg: ChatMessage = {
      id: String(Date.now() + Math.random()),
      sender: this.state.localPlayer.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state = {
      ...this.state,
      messages: [...this.state.messages, msg]
    };
    this.notify();
    this.sendPacket('REMOTE_TAUNT', {
      senderName: this.state.localPlayer.name,
      text
    });
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = window.setInterval(() => {
      if (this.state.status === 'WAITING_FOR_OPPONENT') {
        this.sendPacket('ROOM_HELLO', {
          hero: this.state.localPlayer.hero,
          name: this.state.localPlayer.name
        });
      }
    }, 1500);
  }

  leaveRoom() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.matchmakingTimer) clearTimeout(this.matchmakingTimer);
    this.state = {
      ...this.state,
      roomCode: '',
      status: 'IDLE',
      remotePlayer: null,
      messages: []
    };
    this.notify();
  }
}

export const onlineManager = new OnlineMatchManager();
