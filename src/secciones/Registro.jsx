import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import { useApp } from '../core/store.jsx';
import { haceCorto } from '../core/formato.js';
import './secciones.css';

const ORIGENES = ['Todos', 'A1', 'A2', 'A3', 'Paciente', 'Profesional', 'Operador'];
const TONO_TIPO = { informar: 'cielo', proponer: 'lavanda', pedir: 'manteca', aceptar: 'menta', rechazar: 'rosa' };

// Une los mensajes de todos los casos con la bitácora de las demás secciones, del más nuevo al más viejo.
function juntarEntradas(estado) {
  const deCasos = estado.casos.flatMap((c) =>
    c.registro.map((m) => ({ ...m, casoId: c.id, clave: `${c.id}-${m.n}-${m.hora}-${m.texto}` })));
  const deBitacora = estado.bitacora.map((b) => ({ ...b, n: 'Op', casoId: null, clave: b.id }));
  return [...deCasos, ...deBitacora].reverse().sort((a, b) => b.hora - a.hora);
}

export default function Registro() {
  const { estado } = useApp();
  const [origen, setOrigen] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const entradas = juntarEntradas(estado);
  const q = busqueda.trim().toLowerCase();
  const visibles = entradas.filter((m) =>
    (origen === 'Todos' || m.de === origen || m.a === origen) &&
    (!q || `${m.de} ${m.a} ${m.tipo} ${m.texto}`.toLowerCase().includes(q)));

  const descargar = () => {
    const blob = new Blob([JSON.stringify(visibles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'registro-cartilla-viva.json';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Pagina
      variante="operador"
      activo="Registro"
      titulo="Registro"
      subtitulo="Todo lo que se dijeron los agentes, las profesionales y el operador, en orden."
    >
      <div className="sec-filtros" style={{ marginTop: 40 }}>
        <div className="sec-filtros" role="group" aria-label="Filtrar por participante">
          {ORIGENES.map((o) => (
            <button key={o} type="button" className="sec-filtro" aria-pressed={origen === o} onClick={() => setOrigen(o)}>{o}</button>
          ))}
        </div>
        <input
          className="sec-input sec-buscar"
          type="search"
          placeholder="Buscar en el registro"
          aria-label="Buscar en el registro"
          value={busqueda}
          onChange={(ev) => setBusqueda(ev.target.value)}
        />
      </div>

      <div className="cv-fila" style={{ justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
        <p className="cv-meta" style={{ margin: 0 }} aria-live="polite">{visibles.length} de {entradas.length} mensajes</p>
        <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={descargar} disabled={!visibles.length}>
          Descargar JSON
        </button>
      </div>

      <div className="sec-tarjeta" style={{ marginTop: 12, padding: 0 }}>
        {visibles.length === 0 ? (
          <p className="sec-texto sec-vacio">No hay mensajes que coincidan.</p>
        ) : (
          <ol className="sec-registro">
            {visibles.map((m) => {
              const cuerpo = (
                <span className="sec-registro__cuerpo">
                  <span className="sec-registro__ruta">{m.de} → {m.a}</span>
                  <span className="sec-registro__texto">{m.texto}</span>
                </span>
              );
              return (
                <li key={m.clave}>
                  <Chip tono={TONO_TIPO[m.tipo] ?? 'gris'} chico>{m.tipo}</Chip>
                  <span className="cv-meta">{m.n}</span>
                  {m.casoId ? (
                    <a href={`#/operador/${m.casoId}`}>{cuerpo}</a>
                  ) : cuerpo}
                  <span className="cv-meta">{haceCorto(m.hora, estado.ahora)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Pagina>
  );
}
