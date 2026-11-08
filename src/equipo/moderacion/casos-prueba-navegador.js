// Corre los casos de prueba en el navegador con moderar() (Gemini si hay clave, si no reglas).
// En modo dev queda en la consola como window.__a2.correrPruebas().
import { CASOS } from './casos-prueba.js';
import { moderar } from './moderador.js';

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

export async function correrPruebas({ pausaMs = 4000 } = {}) {
  const filas = [];
  for (const [i, c] of CASOS.entries()) {
    if (i > 0) await pausa(pausaMs);
    const r = await moderar(c.texto);
    filas.push({
      id: c.id,
      esperado: c.esperado,
      decision: r.decision,
      acierto: r.decision === c.esperado ? 'sí' : 'NO',
      fuente: r.fuente,
      ms: r.ia?.ms ?? '',
      error: r.errorIA ?? '',
      texto: c.texto.slice(0, 60),
    });
  }
  const aciertos = filas.filter((f) => f.acierto === 'sí').length;
  console.table(filas);
  console.info(`[A2] Aciertos: ${aciertos}/${filas.length}`);
  return { aciertos, total: filas.length, filas };
}

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__a2 = { correrPruebas };
}
