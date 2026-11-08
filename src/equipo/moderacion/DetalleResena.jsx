import { useState } from 'react';
import { useApp, selProf, selResena } from '../../core/store.jsx';
import { haceTiempo, conArticulo } from '../../core/formato.js';
import './moderacion.css';

const MENSAJE_INSULTO = 'Así no se puede publicar: sacá el insulto. El resto de la crítica está bien.';
const MENSAJE_DATOS = 'Así no se puede publicar: sacá los datos personales. El resto de la crítica está bien.';

// Parte el texto por las apariciones exactas de los fragmentos (sin regex con el texto del usuario).
function partes(texto, fragmentos) {
  const rangos = [];
  for (const f of fragmentos ?? []) {
    if (!f?.texto) continue;
    let desde = 0;
    for (;;) {
      const i = texto.indexOf(f.texto, desde);
      if (i === -1) break;
      rangos.push({ ini: i, fin: i + f.texto.length, tipo: f.tipo });
      desde = i + f.texto.length;
    }
  }
  rangos.sort((a, b) => a.ini - b.ini || b.fin - a.fin);

  const salida = [];
  let pos = 0;
  for (const r of rangos) {
    if (r.ini < pos) continue; // se superpone con uno anterior
    if (r.ini > pos) salida.push({ texto: texto.slice(pos, r.ini) });
    salida.push({ texto: texto.slice(r.ini, r.fin), tipo: r.tipo });
    pos = r.fin;
  }
  if (pos < texto.length) salida.push({ texto: texto.slice(pos) });
  return salida;
}

export default function DetalleResena({ caso }) {
  const { estado, acciones } = useApp();
  const resena = selResena(estado, caso.resenaId);
  const prof = selProf(estado, caso.profId);
  const mod = resena?.moderacion ?? { motivos: [], fragmentos: [], nota: null };
  const hayInsulto = (mod.fragmentos ?? []).some((f) => f.tipo === 'insulto') || (mod.motivos ?? []).some((m) => m.regla === 2);
  const [mensaje, setMensaje] = useState(hayInsulto ? MENSAJE_INSULTO : MENSAJE_DATOS);

  if (!resena || !prof) return <p className="cv-texto">No encontramos la reseña de este caso.</p>;

  const resuelto = caso.estado === 'resuelto';
  const mensajeEnviado = resena.mensajeOperador ?? caso.registro.find((m) => m.n === 'D4' && m.tipo === 'rechazar')?.texto;

  return (
    <>
      <div>
        <p className="cv-meta" style={{ margin: 0 }}>
          Propuesta de A2 · Moderador: <strong className="mod-propuesta">retener</strong>
          {mod.fuente === 'ia' && <span> · Gemini</span>}
        </p>
        <h2 className="cv-titulo-2" style={{ marginTop: 10 }}>Reseña sobre {conArticulo(prof)}</h2>
      </div>

      <div className="cv-pila cv-gap-12">
        <blockquote className="mod-cita">
          {partes(resena.texto, mod.fragmentos).map((p, i) =>
            p.tipo ? <mark key={i} className={`mod-marca mod-marca--${p.tipo === 'insulto' ? 'insulto' : 'dato'}`}>{p.texto}</mark> : <span key={i}>{p.texto}</span>,
          )}
        </blockquote>
        <p className="cv-meta" style={{ margin: 0 }}>{resena.puntaje} de 5 · {haceTiempo(resena.hora, estado.ahora)}</p>
      </div>

      <div className="cv-pila" style={{ gap: 14 }}>
        <h3 className="cv-eyebrow">Por qué</h3>
        {(mod.motivos ?? []).map((m) => (
          <div key={m.texto} className="mod-porque">
            <span className={`cv-punto ${m.regla === 2 ? 'cv-punto--rosa' : 'cv-punto--manteca'}`} />
            {m.texto}
          </div>
        ))}
        {mod.nota && (
          <div className="mod-porque">
            <span className="cv-punto cv-punto--menta" />
            {mod.nota}
          </div>
        )}
      </div>

      {resuelto ? (
        <div className="cv-aviso cv-aviso--menta" role="status">
          <p className="cv-aviso__titulo">
            Decisión registrada: {caso.decision === 'rechazar' ? 'Rechazada y se pidió corrección' : 'Publicada'}
          </p>
          {caso.decision === 'rechazar' && mensajeEnviado && <p className="cv-aviso__texto">«{mensajeEnviado}»</p>}
        </div>
      ) : (
        <>
          <div className="cv-pila cv-gap-8">
            <label className="cv-etiqueta" htmlFor="mod-mensaje">Mensaje al paciente</label>
            <textarea id="mod-mensaje" className="cv-campo" rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </div>
          <div className="cv-fila cv-gap-12">
            <button
              type="button"
              className="cv-boton cv-boton--primario"
              onClick={() => acciones.resolverResena({ casoId: caso.id, decision: 'rechazar', mensaje })}
            >
              Rechazar y pedir corrección
            </button>
            <button
              type="button"
              className="cv-boton cv-boton--secundario"
              onClick={() => acciones.resolverResena({ casoId: caso.id, decision: 'publicar', mensaje })}
            >
              Publicar igual
            </button>
          </div>
        </>
      )}
    </>
  );
}
