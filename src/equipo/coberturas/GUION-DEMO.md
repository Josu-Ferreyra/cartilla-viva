# Guion de la demo (5 minutos)

Paso a paso para los presentadores. > Los pasos 1, 2, 4, 5 y 6 dependen de las áreas 01 y 02 (paciente y moderación); revisar los textos exactos cuando estén integradas.

Antes de empezar: abrir el panel **Demo** (abajo a la derecha) y tocar **Reiniciar demo** (dos clics). El estado queda en `Día 1 · 00 h`, con el caso de la Dra. Gómez ya en la cola.

Todas las rutas son `#/...`; el panel del presentador tiene un link a cada una.

| # | Ruta | Qué se hace | Qué tiene que verse | Frase clave |
|---|---|---|---|---|
| 1 | `#/` | Buscar «Psicología · OSEP · Godoy Cruz». | La lista de profesionales; la Dra. Ruiz aparece con OSEP verificada. | «Cada cobertura muestra cuándo se verificó por última vez y quién la confirmó.» |
| 2 | `#/perfil/ruiz` | Entrar al perfil y reportar que no atiende OSEP. Si el perfil no está a mano: panel → **Simular 1 reporte**. | OSEP pasa a «Sin confirmar» y el paciente ve el aviso correspondiente. | «Un solo reporte no borra nada: el dato queda sin confirmar y se le consulta a la profesional.» |
| 3 | `#/profesional/ruiz` | Tocar **«Sí, ya no atiendo OSEP»** (D3). | Antes: «Hola, Marina», chips «Cobertura de OSEP» y «día 0 de 7», la evidencia y la nota de los 7 días. Después: aviso verde «Listo: sacamos OSEP de tu perfil.» y OSEP «Ya no atiende» en «Tu perfil». | «La baja la confirma la profesional. A3 propone, ella decide.» |
| 4 | `#/resena/ruiz` | Escribir una reseña con un insulto y enviarla. Abrir **«Evidencia de IA»**. | La reseña queda retenida, no se publica. En «Evidencia de IA» se ve que la respuesta vino de **Gemini**, con el modelo y los ms. | «Esta clasificación la hizo la API de Gemini en vivo; la decisión final la toma una persona.» |
| 5 | `#/operador` | Abrir el caso «Reseña retenida» y **rechazar pidiendo corrección** (D4). | El caso pasa a «Resuelto» y el registro suma el mensaje D4 con el pedido de corrección. | «El operador no borra la reseña: le pide al paciente que la corrija.» |
| 6 | `#/resena/ruiz` | El paciente corrige el texto y lo vuelve a enviar. | Ahora se publica y aparece en el perfil. | «Con el texto corregido, el moderador la publica sin intervención.» |
| 7 | `#/operador/caso1` | Caso «En disputa» de la Dra. Gómez · OSDE. Mostrar la contradicción, dejar la nota «Atiende OSDE, pero solo el plan 210.» y **Rechazar la propuesta y corregir** (D7). | Bloque verde «A3 · Verificador: Atiende OSDE» frente al bloque durazno «A1 · Buscador: 3 reportes en 7 días». «Corregir: atiende solo el plan 210» viene seleccionado. Al confirmar: «No se saca: se corrigió a plan 210 (D7).» y el registro suma 5, 6 y D7. | «Dos agentes se contradicen: no desempata uno de ellos, desempata una persona que llamó al consultorio.» |
| 8 | Panel Demo | **Reiniciar demo** (dos clics: «¿Seguro? Tocá de nuevo»). | Vuelve a `#/` con el estado inicial. | «Todo el recorrido se puede repetir desde cero.» |

## Plan B

### Variante F2: la profesional no responde

Sirve si el paso 3 sale mal o si sobra tiempo para mostrar el segundo camino.

1. Panel → **Reiniciar demo**, y después **Simular 1 reporte** (Ruiz / OSEP).
2. **No** responder en `#/profesional/ruiz`.
3. Panel → **+1 día** tres veces. En `#/operador` el caso muestra «día 3 de 7» y el registro suma el «Recordatorio (día 3)».
4. Panel → **+7 días**. El caso pasa a la cola del operador («A3 · Verificador · para el operador»). **OSEP sigue «sin confirmar», no en baja.**
5. En el detalle: escribir el registro de la llamada y tocar **Confirmar baja** (D6). También se puede elegir **Mantener OSEP**.

Frase clave: «Si la profesional no responde, no se borra nada solo: después de 7 días una persona llama al consultorio y decide.»

Otra variante: en el paso 3 tocar **«No, sigo atendiendo OSEP»**. La cobertura queda «En disputa» y el caso pasa a la cola del operador.

### Si se corta internet

La llamada a Gemini del paso 4 falla. A2 vuelve sola a su clasificación por reglas: la reseña se retiene igual y sigue el recorrido. Si «Evidencia de IA» indica que la respuesta no vino de Gemini, decirlo en voz alta en vez de presentarla como si lo fuera. Los pasos 1 a 3 y 5 a 8 no necesitan conexión.
