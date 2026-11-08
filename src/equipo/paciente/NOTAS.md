# Notas del área 01

## Funciones auxiliares (`textos.js`)

La base no tiene funciones para armar los textos de las etiquetas de estado ni para contar reportes:

- `textoChipBusqueda(cob, ahora)`: «OSEP verificada · hace 12 días», con « · plan …» si hay planes.
- `textoChipPerfil(cob, ahora)`: «Sin confirmar · desde hoy», «Ya no atiende», etc.
- `esFemenino(prof)`: mismo criterio que `conArticulo` (el título termina en «a»).
- `resultados(n)`: «1 resultado» / «8 resultados».
- `pacientesQueReportaron(estado, profId, obraSocial)`: cuenta pacientes distintos, como `reglas.reportarNoAtiende`.

`iniciales(nombre)` para el `Avatar` sale de `core/formato.js`, que ya la exporta.

## Decisiones

- El texto del botón para volver es «← Volver a resultados», como pide el enunciado (el componente provisorio de la base decía «← Volver a la búsqueda»).
- La última búsqueda aplicada queda en memoria del módulo: al volver del perfil se ven los mismos filtros. Un F5 vuelve a `BUSQUEDA_INICIAL` (todos los filtros en «TODOS»).
- Con un solo resultado el encabezado dice «1 resultado».
- El aviso «sin confirmar» concuerda con el profesional («la profesional» / «el profesional», «la» / «lo incluye»). La parte «Un paciente reportó…» solo aparece si hubo reportes; si la cobertura quedó sin confirmar por una verificación de A3, el aviso empieza por la cartilla.
- «Escribir por WhatsApp» y «Llamar» son `<a href="#">` sin pantalla en la demo: cancelan la navegación para no volver a la búsqueda.
- Si el paciente reportó más de una obra social, se muestra un renglón «Reportaste…» por cada una.
- La fila de resultado no se parte en escritorio (`flex-wrap: nowrap`): con el ancho de la columna (unos 710 px), el `flex: 1 1 220px` del enunciado mandaba «Ver perfil →» a otro renglón. El bloque del nombre se achica y su texto baja de renglón. Debajo de 760 px la fila vuelve a partirse.
- El puntaje y la cantidad de reseñas se calculan con `selResumenResenas` a partir de las reseñas publicadas, así que buscador, perfil y listado de reseñas siempre coinciden y se actualizan al publicar o eliminar una. `rating` y `cantResenas` de `datos.js` solo sirven de objetivo para generar las reseñas de ejemplo (`core/resenasSemilla.js`).
- Buscador por nombre: ignora mayúsculas y tildes. Se aplica con «Buscar», como los demás filtros.
- Con cobertura «TODOS» cada profesional aparece con su mejor cobertura (nunca «Particular», que no se busca). Los anuncios aprobados también respetan «TODOS».
- Plan: el campo aparece solo si hay una obra social elegida y se compara con `cob.planes` (sin tildes ni mayúsculas, coincidencia exacta: 310 no encuentra 410). Si el profesional no cargó planes no hay restricción conocida, así que aparece igual.
- Orden: «Cobertura verificada y cercanía» (por defecto), «Mejor puntuados» y «Más reseñas». Se aplica al elegirlo y desempata por el otro criterio y luego por cercanía; sin reseñas quedan al final.
