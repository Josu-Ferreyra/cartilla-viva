// Cliente mínimo de la API de Gemini (sin SDK). No usa React, window ni localStorage:
// también lo importa el script de Node (evidencia/probar-a2.mjs).
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generarJSON({ apiKey, modelo, instrucciones, texto, timeoutMs = 8000 }) {
  const t0 = Date.now();
  const r = await fetch(`${URL_BASE}/${modelo}:generateContent`, {
    method: 'POST',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instrucciones }] },
      contents: [{ role: 'user', parts: [{ text: texto }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 400, responseMimeType: 'application/json' },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const candidato = data?.candidates?.[0];
  const salida = candidato?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  // Si Gemini bloquea la respuesta o se queda sin tokens, la salida viene vacía: lo informamos con el motivo.
  if (!salida) {
    const motivo = data?.promptFeedback?.blockReason ?? candidato?.finishReason ?? 'sin respuesta';
    throw new Error(`Gemini sin texto (${motivo})`);
  }
  return { salida, ms: Date.now() - t0 };
}
