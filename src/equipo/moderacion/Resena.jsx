import { useState } from 'react';
import Header from '../../componentes/Header.jsx';
import { useApp, selProf, selUltimaResenaDelPaciente } from '../../core/store.jsx';
import { conArticulo } from '../../core/formato.js';
import { REGLAS, moderar, configIA } from './moderador.js';
import { registrar } from './registroIA.js';
import RegistroIA from './RegistroIA.jsx';
import './casos-prueba-navegador.js'; // expone window.__a2 en modo dev
import './moderacion.css';

const TEXTO_INSULTO = 'Me cobraron particular aunque figuraba con OSEP… y la secretaria, Laura, es una [insulto].';
const TEXTO_VALIDO = 'Me cobraron particular aunque en la plataforma figuraba con OSEP. La atención fue buena, pero confirmen la cobertura antes de ir.';

function Estrella({ llena }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={llena ? '#F5D08A' : 'none'} stroke="#D9A441" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
  );
}

function PieFuente({ resultado }) {
  const { apiKey, modelo } = configIA();
  const usaIA = resultado ? resultado.fuente === 'ia' : Boolean(apiKey);
  const modeloUsado = resultado?.ia?.modelo ?? modelo;
  return (
    <p className="cv-meta mod-pie-fuente">
      {usaIA ? `Moderación: A2 con Gemini (${modeloUsado})` : 'Moderación: reglas fijas (sin conexión)'}
    </p>
  );
}

export default function Resena({ profId }) {
  const { estado, acciones } = useApp();
  const prof = selProf(estado, profId);
  const ultima = selUltimaResenaDelPaciente(estado, profId);
  const rechazada = ultima?.estado === 'rechazada' ? ultima : null;

  const [puntaje, setPuntaje] = useState(rechazada?.puntaje ?? 2);
  const [texto, setTexto] = useState(rechazada?.texto ?? TEXTO_INSULTO);
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [versionLog, setVersionLog] = useState(0);

  const cambiarTexto = (t) => { setTexto(t); setResultado(null); };

  async function publicar() {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const r = await moderar(texto);
    registrar({
      fecha: new Date().toISOString(),
      texto,
      fuente: r.fuente,
      modelo: r.ia?.modelo ?? (r.errorIA ? configIA().modelo : null),
      ms: r.ia?.ms ?? null,
      decision: r.decision,
      motivos: r.motivos.map((m) => m.texto),
      error: r.errorIA ?? null,
    });
    acciones.enviarResena({ profId, puntaje, texto, moderacion: r });
    setResultado(r);
    setVersionLog((v) => v + 1);
    setEnviando(false);
  }

  if (!prof) {
    return (
      <div className="cv-pagina">
        <Header variante="paciente" volver={{ href: '#/', texto: '← Volver a resultados' }} />
        <main className="cv-contenedor cv-main">
          <h1 className="cv-titulo-1 cv-titulo-1--m">No encontramos a este profesional</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="cv-pagina">
      <Header variante="paciente" volver={{ href: `#/perfil/${profId}`, texto: '← Volver al perfil' }} />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1 cv-titulo-1--m">Tu reseña sobre {conArticulo(prof)}</h1>
        <p className="cv-subtitulo">Antes de publicarse pasa por la moderación.</p>

        {rechazada && !resultado && (
          <div className="cv-aviso cv-aviso--rosa" style={{ marginTop: 32 }} role="status">
            <p className="cv-aviso__titulo">El equipo pidió un cambio</p>
            <p className="cv-aviso__texto">{rechazada.mensajeOperador}</p>
          </div>
        )}

        <div className="cv-columnas">
          <section className="cv-col-principal cv-pila cv-gap-24">
            <div className="cv-panel cv-pila cv-gap-32" style={{ padding: 40 }}>
              <div className="cv-pila cv-gap-8">
                <span className="cv-etiqueta">Puntaje</span>
                <div className="mod-estrellas" role="group" aria-label="Puntaje">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="mod-estrella"
                      aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                      aria-pressed={n === puntaje}
                      onClick={() => setPuntaje(n)}
                    >
                      <Estrella llena={n <= puntaje} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="cv-pila cv-gap-8">
                <label className="cv-etiqueta" htmlFor="mod-texto">Contá tu experiencia</label>
                <textarea id="mod-texto" className="cv-campo" rows={5} value={texto} onChange={(e) => cambiarTexto(e.target.value)} />
                <div className="cv-fila cv-gap-8">
                  <span className="cv-meta">Probar un ejemplo:</span>
                  <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => cambiarTexto(TEXTO_INSULTO)}>Con insulto</button>
                  <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => cambiarTexto(TEXTO_VALIDO)}>Crítica válida</button>
                </div>
              </div>

              <button
                type="button"
                className="cv-boton cv-boton--primario"
                style={{ alignSelf: 'flex-start' }}
                onClick={publicar}
                disabled={enviando || !texto.trim()}
              >
                {enviando ? 'Revisando…' : 'Publicar reseña'}
              </button>
            </div>

            <div role="status">
              {resultado?.decision === 'retener' && (
                <div className="cv-aviso cv-aviso--rosa">
                  <p className="cv-aviso__titulo">Retenida para revisión</p>
                  <ul className="mod-motivos">
                    {resultado.motivos.map((m) => <li key={m.texto}>{m.texto}</li>)}
                  </ul>
                  <p className="mod-aviso-chico">Una persona del equipo la revisa en 48 h. Si la corregís ahora, vuelve a pasar por la moderación.</p>
                </div>
              )}
              {resultado?.decision === 'publicar' && (
                <div className="cv-aviso cv-aviso--menta">
                  <p className="cv-aviso__titulo">Publicada</p>
                  <p className="cv-aviso__texto">Cumple las reglas públicas. Las críticas también se publican.</p>
                  <p className="cv-aviso__texto"><a href={`#/perfil/${profId}`}>Ver el perfil →</a></p>
                </div>
              )}
            </div>
          </section>

          <aside className="cv-col-lateral cv-pila cv-gap-24" style={{ padding: '8px 0' }} aria-label="Reglas públicas">
            <h2 className="cv-eyebrow">Reglas públicas</h2>
            {REGLAS.map((r) => (
              <div key={r.n} className="mod-regla">
                <span className="mod-regla__n">{r.n}</span>
                <p className="mod-regla__texto">{r.texto}</p>
              </div>
            ))}
            <PieFuente resultado={resultado} />
            <RegistroIA version={versionLog} />
          </aside>
        </div>
      </main>
    </div>
  );
}
