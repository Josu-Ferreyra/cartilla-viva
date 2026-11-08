# Notas del área 03

## Diferencias con el enunciado

Las firmas reales de la base difieren de lo que dice el enunciado:

- Las acciones salen de `useApp()` como `const { estado, acciones } = useApp()`, no como imports sueltos.
- `selCaso`, `selProf` y `selAlertasPendientes` reciben el `estado` como primer argumento: `selCaso(estado, id)`.
- `haceTiempo(hora, ahora)`, `diaDeSiete(caso, ahora)` y `horaDemo(ahora)` necesitan `estado.ahora`.

## Helpers locales (`utilidades.js`)

La base no tiene selectores para los reportes ni para formatear nombres y planes:

- `reportesDe(estado, profId, obraSocial, desdeHora)`: reportes de un profesional y una obra social.
- `pacientesDistintos(reportes)`: mismo criterio que `reglas.reportarNoAtiende` (cuenta pacientes, no reportes).
- `pacientes(n)`: «1 paciente» / «3 pacientes».
- `primerNombre(nombre)`: «Dra. Marina Ruiz» → «Marina».
- `separarPlanes(texto)` / `unirPlanes(planes)`: «210, 310» ↔ `['210', '310']`.

## Decisiones

- Al responder una alerta, `responderAlerta` la saca de las pendientes. El aviso de confirmación vive en el estado local de `Profesional`, así que desaparece si se navega a otra pantalla y se vuelve.
- Los números de reportes (alerta, evidencia y disputa) cuentan **pacientes distintos**, no reportes. «Simular 1 reporte» repetido desde el mismo paciente no infla el contador.
- En el detalle de disputa el botón de acción se deshabilita si se elige «Corregir» y el campo de planes queda vacío.
- El panel del presentador queda abierto al navegar o reiniciar; se cierra con «Cerrar», con el botón flotante o con Escape. La confirmación de «Reiniciar demo» vence a los 4 segundos.
