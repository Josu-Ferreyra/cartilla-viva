# Notas del área 02 · Moderación

- `haceTiempo(hora, ahora)` de `core/formato.js` recibe también `ahora`. En `DetalleResena` se llama con `estado.ahora`; la spec la nombraba con un solo argumento.
- `moderador.js` exporta además `configIA()` (lee `VITE_GEMINI_API_KEY` y `VITE_GEMINI_MODEL`), `MODELO_POR_DEFECTO` y `PROMPT_SISTEMA`. `Resena.jsx` usa `configIA()` para mostrar, antes de enviar, qué fuente se va a usar.
- **Corrección a la spec:** el código de ejemplo de `gemini.js` mandaba `parts: [{ text }]`, pero el parámetro se llama `texto`, así que fallaba con «text is not defined». Quedó como `parts: [{ text: texto }]`.
- `gemini.js` lanza un error «Gemini sin texto (motivo)» cuando la respuesta viene vacía (bloqueo de seguridad o `MAX_TOKENS`). Así el plan B de reglas registra el motivo en vez de «JSON inválido».
- **Para verificar antes de la demo:** `maxOutputTokens: 400` sale de la spec. Si el modelo «piensa» antes de responder y se queda sin tokens, el registro va a mostrar `Gemini sin texto (MAX_TOKENS)`. En ese caso, subir el valor en `gemini.js`.
- Regla de prudencia: si Gemini dice «publicar» pero las reglas encuentran un insulto, se retiene con `fuente: 'ia'` y `ia.decisionCruda: 'publicar'`.
