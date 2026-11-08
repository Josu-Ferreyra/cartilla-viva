import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import Estrellas from '../componentes/Estrellas.jsx';
import NoEncontrada from '../componentes/NoEncontrada.jsx';
import { useApp, selProf, selResenasPublicadas } from '../core/store.jsx';
import { haceTiempo, numero } from '../core/formato.js';
import './secciones.css';

const FILTROS = [
  ['todas', 'Todas'],
  ['sin_responder', 'Sin responder'],
  ['respondidas', 'Con respuesta'],
];
const MAX_RESPUESTA = 400;

function Respuesta({ resena }) {
  const { acciones } = useApp();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(resena.respuesta?.texto ?? '');

  const guardar = (ev) => {
    ev.preventDefault();
    if (!texto.trim()) return;
    acciones.responderResenaRecibida({ resenaId: resena.id, texto });
    setEditando(false);
  };
  const quitar = () => {
    acciones.responderResenaRecibida({ resenaId: resena.id, texto: '' });
    setTexto('');
  };
  const cancelar = () => { setTexto(resena.respuesta?.texto ?? ''); setEditando(false); };

  if (editando) {
    return (
      <form className="sec-campo" onSubmit={guardar}>
        <label className="cv-etiqueta" htmlFor={`resp-${resena.id}`}>Tu respuesta pública</label>
        <textarea
          id={`resp-${resena.id}`}
          className="sec-area"
          value={texto}
          maxLength={MAX_RESPUESTA}
          onChange={(ev) => setTexto(ev.target.value)}
          autoFocus
        />
        <p className="sec-ayuda">{texto.length} / {MAX_RESPUESTA}. Se muestra debajo de la reseña, en tu perfil.</p>
        <div className="cv-fila cv-gap-12">
          <button type="submit" className="cv-boton cv-boton--chico cv-boton--primario" disabled={!texto.trim()}>Publicar respuesta</button>
          <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={cancelar}>Cancelar</button>
        </div>
      </form>
    );
  }
  if (resena.respuesta) {
    return (
      <>
        <div className="sec-respuesta">
          <span className="cv-eyebrow">Tu respuesta</span>
          <p>{resena.respuesta.texto}</p>
        </div>
        <div className="cv-fila cv-gap-12">
          <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => setEditando(true)}>Editar respuesta</button>
          <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={quitar}>Quitar</button>
        </div>
      </>
    );
  }
  return (
    <div>
      <button type="button" className="cv-boton cv-boton--chico cv-boton--primario" onClick={() => setEditando(true)}>Responder</button>
    </div>
  );
}

export default function ResenasRecibidas() {
  const { estado } = useApp();
  const [filtro, setFiltro] = useState('todas');
  const prof = selProf(estado, estado.profesionalActual);
  if (!prof) return <NoEncontrada />;

  const publicadas = selResenasPublicadas(estado, prof.id);
  const enRevision = estado.resenas.filter((r) => r.profId === prof.id && r.estado === 'retenida').length;
  const sinResponder = publicadas.filter((r) => !r.respuesta).length;
  const lista = publicadas.filter((r) =>
    filtro === 'todas' || (filtro === 'sin_responder' ? !r.respuesta : !!r.respuesta));

  return (
    <Pagina
      variante="profesional"
      activo="Reseñas"
      titulo="Reseñas"
      subtitulo={sinResponder
        ? `Tenés ${sinResponder} ${sinResponder === 1 ? 'reseña' : 'reseñas'} sin responder.`
        : 'Respondiste todas las reseñas.'}
    >
      <div className="cv-columnas">
        <div className="cv-col-principal cv-pila cv-gap-16">
          <div className="sec-filtros" role="group" aria-label="Filtrar reseñas">
            {FILTROS.map(([clave, texto]) => (
              <button key={clave} type="button" className="sec-filtro" aria-pressed={filtro === clave} onClick={() => setFiltro(clave)}>
                {texto}
              </button>
            ))}
          </div>

          {lista.length === 0 ? (
            <div className="sec-tarjeta sec-vacio">
              <p className="sec-texto">No hay reseñas en este filtro.</p>
            </div>
          ) : lista.map((r) => (
            <article key={r.id} className="sec-tarjeta sec-resena" aria-label={`Reseña de ${r.puntaje} estrellas`}>
              <div className="sec-resena__cabecera">
                <Estrellas valor={r.puntaje} />
                <span className="cv-meta">Paciente verificado · {haceTiempo(r.hora, estado.ahora)}</span>
              </div>
              <p className="sec-texto">{r.texto}</p>
              <Respuesta resena={r} />
            </article>
          ))}
        </div>

        <aside className="cv-col-lateral cv-pila cv-gap-16" aria-label="Resumen">
          <h2 className="cv-eyebrow">Resumen</h2>
          <div className="sec-tarjeta cv-pila cv-gap-16">
            <div className="cv-fila cv-gap-12" style={{ alignItems: 'baseline' }}>
              <span className="sec-puntaje">{numero(prof.rating)}</span>
              <span className="cv-meta">de 5 · {prof.cantResenas} reseñas</span>
            </div>
            <div className="cv-fila cv-gap-8">
              <Chip tono="menta">{publicadas.length} publicadas</Chip>
              {enRevision > 0 && <Chip tono="manteca">{enRevision} en revisión</Chip>}
            </div>
            <p className="sec-ayuda">Las reseñas en revisión no se muestran hasta que una persona del equipo las resuelva.</p>
          </div>
        </aside>
      </div>
    </Pagina>
  );
}
