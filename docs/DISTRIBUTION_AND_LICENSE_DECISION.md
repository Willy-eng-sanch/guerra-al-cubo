# Distribución y decisión de licencia

**Estado:** pendiente de decisión del mantenedor.  
**Decisión confirmada:** no publicar una licencia por ahora.

Este documento organiza la evaluación; no constituye asesoría jurídica ni elige una licencia en nombre del titular.

## 1. Separar los activos

Antes de elegir una licencia, inventariar por separado:

| Activo | Pregunta |
|---|---|
| Código fuente | ¿Se permite copiar, modificar y redistribuir? |
| Arte y sprites | ¿Se permite reutilizar, modificar y crear derivados? |
| Música y efectos | ¿Quién posee los derechos y qué usos permite? |
| Textos, lore y cartas | ¿Pueden traducirse, adaptarse o redistribuirse? |
| Marca y logotipo | ¿Se permite usar el nombre para forks o productos derivados? |
| Builds ejecutables | ¿Se pueden redistribuir y bajo qué condiciones? |
| Contribuciones | ¿Qué permisos concede cada colaborador al proyecto? |
| Dependencias | ¿Qué obligaciones imponen sus licencias? |

Una licencia de software no licencia automáticamente todos los elementos artísticos, marcas o contenido del juego.

## 2. Modelos que deben compararse

### MIT
- Muy permisiva y sencilla.
- Facilita forks, uso comercial y redistribución.
- No obliga a publicar modificaciones.
- Puede ser adecuada si se prioriza adopción amplia y se acepta que terceros mantengan variantes cerradas.

### GPL-3.0
- Permite uso, modificación y redistribución.
- Las obras derivadas distribuidas deben respetar obligaciones de copyleft.
- No impone por sí sola publicar modificaciones de un servicio que solo se ejecuta en servidor.
- Puede encajar si se quiere que las versiones redistribuidas del juego sigan siendo libres.

### AGPL-3.0
- Añade obligaciones de ofrecer el código fuente correspondiente a usuarios que interactúan remotamente con una versión modificada cubierta por la licencia.
- Puede ser relevante si el proyecto se convierte en un servicio de juego alojado por terceros.
- Exige comprender bien el alcance y las obligaciones antes de adoptarla.

### Modelo mixto
- Código bajo una licencia de software.
- Arte, música, marca y documentación bajo licencias separadas.
- Puede reservar la marca y definir condiciones distintas para assets.
- Requiere inventario, avisos claros y asesoría sobre compatibilidad entre componentes.

## 3. Preguntas que determinan la elección

El mantenedor debe decidir:

1. ¿Quieres permitir que cualquiera cree un fork y lo distribuya?
2. ¿Quieres exigir que las modificaciones distribuidas del código permanezcan abiertas?
3. ¿Quieres exigir publicación de modificaciones cuando alguien aloje un servidor accesible por red?
4. ¿Permitirás uso comercial de forks?
5. ¿El arte podrá reutilizarse por otros proyectos o solo el código?
6. ¿Se aceptarán contribuciones externas de código, arte y música?
7. ¿Quieres reservar el nombre, logotipo y branding frente a forks?
8. ¿Cómo se gestionarán derechos de menores, pseudónimos y colaboradores internacionales?

## 4. Recomendación de evaluación

No seleccionar MIT, GPL o AGPL solo por popularidad. Comparar el modelo real de distribución:
- repositorio público y forks;
- builds descargables;
- posible alojamiento de partidas;
- assets artísticos originales;
- contribuciones externas;
- uso comercial futuro y sostenibilidad.

Si el objetivo es que cualquier fork distribuido mantenga el código abierto, compara GPL. Si también importa el despliegue de versiones modificadas como servicio de red, compara AGPL. Si priorizas máxima reutilización, compara MIT. En todos los casos, revisar separadamente los derechos de arte y marca.

## 5. Checklist antes de publicar licencia

- [ ] Inventario de archivos propios, terceros y dependencias.
- [ ] Verificar titularidad y procedencia de cada asset.
- [ ] Confirmar permisos de contribuyentes anteriores.
- [ ] Elegir licencia de código.
- [ ] Elegir licencia de arte, audio y documentación, si procede.
- [ ] Definir política de marca y nombre.
- [ ] Definir cómo se aceptarán contribuciones externas.
- [ ] Revisar compatibilidad de dependencias.
- [ ] Añadir archivos LICENSE y avisos de terceros.
- [ ] Actualizar README y política de contribución.
- [ ] Obtener revisión jurídica adecuada a Colombia y a los países donde se distribuirá.

## 6. Estado actual

No añadir un archivo LICENSE provisional ni presentar el proyecto como open source formal hasta que el mantenedor confirme la decisión. GitHub puede mostrar el repositorio públicamente, pero eso no equivale a conceder permisos generales de reutilización.
