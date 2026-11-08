// Prueba de A2 (moderador) contra la API de Gemini, con los casos de casos-prueba.js.
// Uso: npm run probar:ia   (lee la clave de .env.local con node --env-file)
// Genera evidencia/resultados-a2-AAAA-MM-DD.json y .md
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { moderarConConfig, moderarConReglas, MODELO_POR_DEFECTO } from '../src/equipo/moderacion/moderador.js';
import { CASOS } from '../src/equipo/moderacion/casos-prueba.js';

const PAUSA_MS = 4000; // para no pasar el límite gratuito de pedidos por minuto
const carpeta = dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.VITE_GEMINI_API_KEY;
const modelo = process.env.VITE_GEMINI_MODEL || MODELO_POR_DEFECTO; // admite varios, separados por coma

if (!apiKey) {
  console.error('Falta la clave de Gemini.');
  console.error('1. Sacala gratis en https://aistudio.google.com (Get API key).');
  console.error('2. Copiá .env.example a .env.local y completá VITE_GEMINI_API_KEY.');
  console.error('3. Volvé a correr: npm run probar:ia');
  process.exit(1);
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const hoy = new Date();
const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
const celda = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

console.log(`A2 · ${CASOS.length} casos · modelo ${modelo} · pausa ${PAUSA_MS / 1000} s entre llamadas\n`);

const resultados = [];
for (const [i, caso] of CASOS.entries()) {
  if (i > 0) await pausa(PAUSA_MS);
  const r = await moderarConConfig(caso.texto, { apiKey, modelo });
  const reglas = moderarConReglas(caso.texto);
  const respondioIA = r.fuente === 'ia';
  const decisionGemini = respondioIA ? r.ia.decisionCruda : null;

  const fila = {
    id: caso.id,
    texto: caso.texto,
    esperado: caso.esperado,
    gemini: decisionGemini,
    final: r.decision,
    reglas: reglas.decision,
    aciertoGemini: respondioIA ? decisionGemini === caso.esperado : null,
    aciertoFinal: r.decision === caso.esperado,
    aciertoReglas: reglas.decision === caso.esperado,
    ms: r.ia?.ms ?? null,
    fuente: r.fuente,
    motivos: r.motivos,
    fragmentos: r.fragmentos,
    nota: r.nota,
    error: r.errorIA ?? null,
  };
  resultados.push(fila);

  const marca = fila.aciertoFinal ? 'OK ' : 'MAL';
  const extra = fila.error ? ` · error: ${fila.error}` : ` · ${fila.ms} ms`;
  console.log(`${marca} ${caso.id} esperado=${caso.esperado} gemini=${decisionGemini ?? '—'} reglas=${reglas.decision}${extra}`);
}

const conIA = resultados.filter((f) => f.fuente === 'ia');
const aciertosGemini = conIA.filter((f) => f.aciertoGemini).length;
const aciertosFinal = resultados.filter((f) => f.aciertoFinal).length;
const aciertosReglas = resultados.filter((f) => f.aciertoReglas).length;
const errores = resultados.filter((f) => f.error);
const tiempos = conIA.map((f) => f.ms).filter((n) => typeof n === 'number');
const promedioMs = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : null;

const resumen = {
  fecha: hoy.toISOString(),
  modelo,
  total: resultados.length,
  respondidosPorGemini: conIA.length,
  aciertosGemini,
  aciertosFinal,
  aciertosReglas,
  errores: errores.length,
  promedioMs,
};

const base = join(carpeta, `resultados-a2-${fecha}`);
await writeFile(`${base}.json`, JSON.stringify({ resumen, resultados }, null, 2) + '\n', 'utf8');

const md = [
  `# Resultados de A2 (moderador) con Gemini · ${fecha}`,
  '',
  `- **Modelo:** ${modelo}`,
  `- **Fecha:** ${hoy.toLocaleString('es-AR')}`,
  `- **Casos:** ${resultados.length} (respondidos por Gemini: ${conIA.length}; con error y plan B de reglas: ${errores.length})`,
  `- **Aciertos de Gemini:** ${aciertosGemini}/${conIA.length}`,
  `- **Aciertos de las reglas fijas:** ${aciertosReglas}/${resultados.length}`,
  `- **Aciertos de la decisión final** (Gemini + regla prudente de insultos): ${aciertosFinal}/${resultados.length}`,
  `- **Tiempo promedio de Gemini:** ${promedioMs ?? '—'} ms`,
  '',
  '| # | Reseña | Esperado | Gemini | Reglas | Final | ¿Acierta? | ms | Error |',
  '|---|---|---|---|---|---|---|---|---|',
  ...resultados.map((f) =>
    `| ${f.id} | ${celda(f.texto)} | ${f.esperado} | ${f.gemini ?? '—'} | ${f.reglas} | ${f.final} | ${f.aciertoFinal ? 'sí' : '**no**'} | ${f.ms ?? '—'} | ${celda(f.error ?? '')} |`),
  '',
  'Gemini solo propone: toda reseña retenida va a la cola y la decide una persona (D4).',
  'Datos de prueba inventados. En el nivel gratuito, Google puede usar el contenido para mejorar sus productos.',
  '',
].join('\n');
await writeFile(`${base}.md`, md, 'utf8');

console.log(`\nGemini: ${aciertosGemini}/${conIA.length} · Reglas: ${aciertosReglas}/${resultados.length} · Final: ${aciertosFinal}/${resultados.length} · ${promedioMs ?? '—'} ms promedio`);
console.log(`Guardado en evidencia/resultados-a2-${fecha}.json y .md`);
