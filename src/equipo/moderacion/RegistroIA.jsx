import { useEffect, useState } from 'react';
import Chip from '../../componentes/Chip.jsx';
import { leer, limpiar } from './registroIA.js';

const hora = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

function descargar(entradas) {
  const blob = new Blob([JSON.stringify(entradas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'log-a2.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// `version` cambia cada vez que Resena registra una llamada, para volver a leer el log.
export default function RegistroIA({ version = 0 }) {
  const [entradas, setEntradas] = useState(leer);
  useEffect(() => { setEntradas(leer()); }, [version]);

  const recientes = [...entradas].reverse();

  return (
    <details className="mod-registro">
      <summary>Evidencia de IA ({entradas.length} llamadas)</summary>
      {recientes.length === 0 ? (
        <p className="cv-meta mod-registro__vacio">Todavía no hay llamadas. Publicá una reseña para registrar la primera.</p>
      ) : (
        <div className="mod-registro__tabla-wrap">
          <table className="mod-registro__tabla">
            <thead>
              <tr><th>Hora</th><th>Fuente</th><th>Modelo</th><th>ms</th><th>Decisión</th></tr>
            </thead>
            <tbody>
              {recientes.map((e, i) => (
                <tr key={`${e.fecha}-${i}`} title={e.error ? `Error: ${e.error}` : e.texto}>
                  <td>{hora(e.fecha)}</td>
                  <td>{e.fuente === 'ia' ? <Chip tono="menta" chico>Gemini</Chip> : <Chip tono="gris" chico>Reglas</Chip>}</td>
                  <td>{e.modelo ?? '—'}{e.error ? <span className="mod-registro__error"> · {e.error}</span> : null}</td>
                  <td>{e.ms ?? '—'}</td>
                  <td>{e.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="cv-fila cv-gap-8 mod-registro__acciones">
        <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => descargar(entradas)} disabled={!entradas.length}>
          Descargar log (JSON)
        </button>
        <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => { limpiar(); setEntradas([]); }} disabled={!entradas.length}>
          Limpiar
        </button>
      </div>
    </details>
  );
}
