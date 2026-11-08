# Evidencia del prototipo de IA (A2 · Gemini)

## 1. Qué es

A2, el moderador de reseñas de Cartilla Viva, usa la **API de Gemini** (nivel gratuito de Google AI Studio) para clasificar cada reseña en **«publicar»** o **«retener»** según las cuatro reglas públicas de moderación. Gemini solo propone: las reseñas retenidas van a la cola de revisión y **una persona del equipo decide** (D4). A2 nunca borra ni publica una reseña retenida.

Si no hay clave, se corta internet o la API devuelve un error (por ejemplo 429), A2 vuelve solo a un plan B de reglas fijas, y el error queda en el registro.

Código: [`src/equipo/moderacion/`](../src/equipo/moderacion/)
- `gemini.js`: cliente mínimo de la API (`generateContent`, sin SDK).
- `moderador.js`: instrucciones del sistema con las reglas y 3 ejemplos, validación del JSON y plan B de reglas.
- `casos-prueba.js`: las 20 reseñas de prueba de la Entrega 4.

## 2. Cómo reproducirlo

1. Sacar una clave gratis en [Google AI Studio](https://aistudio.google.com) con «Get API key», en un proyecto **sin facturación**.
2. Copiar `.env.example` a `.env.local` y completar `VITE_GEMINI_API_KEY`. `.env.local` **no se sube** al repo.
3. Correr:
   ```bash
   npm install
   npm run dev        # la app en http://localhost:5173 → #/resena/ruiz
   npm run probar:ia  # corre los 20 casos contra Gemini y genera los resultados
   ```
4. En la consola del navegador (modo dev) también se puede correr `window.__a2.correrPruebas()`.

## 3. Resultados

> Pendiente: correr `npm run probar:ia` y completar esta sección.

- Último resultado: [`resultados-a2-AAAA-MM-DD.md`](./) <!-- reemplazar por el archivo generado -->
- Gemini acertó **[__]/20** contra **[__]/20** de las reglas fijas.

## 4. Capturas (`evidencia/capturas/`)

| Archivo | Qué muestra |
|---|---|
| `01-resena-retenida-gemini.png` | La pantalla de reseña con el resultado «Retenida para revisión» y el pie «Moderación: A2 con Gemini». |
| `02-registro-ia.png` | El panel «Evidencia de IA» abierto, con varias llamadas, sus modelos y sus tiempos. |
| `03-operador-detalle.png` | El detalle del operador con «Laura» resaltada en manteca y «[insulto]» en rosa. |
| `04-consola-o-network.png` | DevTools › Network con la llamada a `generativelanguage.googleapis.com` y la respuesta 200 (con la clave tapada). |
| `05-script-terminal.png` | La salida de `npm run probar:ia`. |

## 5. Límites

- Usa **datos de prueba inventados**: ningún paciente ni profesional es real.
- Corre **solo en local**: con Vite la clave queda dentro del código del navegador, por eso la app no se publica.
- La clave no se sube al repositorio (`.env.local` está en `.gitignore`).
- En el nivel gratuito, Google puede usar el contenido enviado para mejorar sus productos: por eso solo se mandan datos de prueba.
- Las reglas fijas no detectan a propósito algunos casos (DNI con puntos, insultos fuera de la lista, datos de salud de terceros). Esos casos muestran dónde aporta la IA.
