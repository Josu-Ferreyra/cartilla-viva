import { useEffect, useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import Estrellas from '../componentes/Estrellas.jsx';
import { useApp, selProf, selResenasDelPaciente } from '../core/store.jsx';
import { ESTADO_RESENA, haceTiempo } from '../core/formato.js';
import './secciones.css';

function Tarjeta({ resena }) {
  const { estado, acciones } = useApp();
  const [confirmando, setConfirmando] = useState(false);
  const prof = selProf(estado, resena.profId);
  const est = ESTADO_RESENA[resena.estado];

  // La confirmación de «Eliminar» vence sola si no se completa.
  useEffect(() => {
    if (!confirmando) return undefined;
    const t = setTimeout(() => setConfirmando(false), 4000);
    return () => clearTimeout(t);
  }, [confirmando]);

  const eliminar = () => {
    if (!confirmando) { setConfirmando(true); return; }
    acciones.eliminarResena({ resenaId: resena.id });
  };

  return (
    <article className="sec-tarjeta sec-resena" aria-label={`Reseña sobre ${prof?.nombre ?? resena.profId}`}>
      <div className="sec-resena__cabecera">
        <a className="sec-resena__nombre" href={`#/perfil/${resena.profId}`}>{prof?.nombre ?? resena.profId}</a>
        <Chip tono={est.tono} chico>{est.texto}</Chip>
        {resena.reemplazadaPor && <Chip tono="gris" chico>Reemplazada</Chip>}
        <span className="cv-meta" style={{ marginLeft: 'auto' }}>{haceTiempo(resena.hora, estado.ahora)}</span>
      </div>
      <Estrellas valor={resena.puntaje} />
      <p className="sec-texto">{resena.texto}</p>

      {resena.estado === 'retenida' && (
        <div className="cv-aviso cv-aviso--manteca">
          <p className="cv-aviso__titulo">Una persona del equipo la está revisando</p>
          <p className="cv-aviso__texto">No se muestra en el perfil hasta que se resuelva. Lo hacemos dentro de las 48 h.</p>
        </div>
      )}
      {resena.estado === 'rechazada' && (
        <div className="cv-aviso cv-aviso--rosa">
          <p className="cv-aviso__titulo">Te pedimos un cambio</p>
          <p className="cv-aviso__texto">{resena.mensajeOperador}</p>
        </div>
      )}
      {resena.estado === 'publicada' && resena.respuesta && (
        <div className="sec-respuesta">
          <span className="cv-eyebrow">Respuesta de {prof?.nombreCorto}</span>
          <p>{resena.respuesta.texto}</p>
        </div>
      )}

      <div className="cv-fila cv-gap-12">
        {resena.estado === 'rechazada' && !resena.reemplazadaPor && (
          <a className="cv-boton cv-boton--chico cv-boton--primario" href={`#/resena/${resena.profId}`}>Escribir de nuevo</a>
        )}
        <button
          type="button"
          className={`cv-boton cv-boton--chico cv-boton--secundario${confirmando ? ' cob-presentador__reiniciar--confirmar' : ''}`}
          onClick={eliminar}
        >
          {confirmando ? '¿Seguro? Tocá de nuevo' : 'Eliminar'}
        </button>
      </div>
    </article>
  );
}

export default function MisResenas() {
  const { estado } = useApp();
  const resenas = selResenasDelPaciente(estado);
  const publicadas = resenas.filter((r) => r.estado === 'publicada').length;

  return (
    <Pagina
      variante="paciente"
      activo="Mis reseñas"
      titulo="Mis reseñas"
      subtitulo={resenas.length
        ? `Escribiste ${resenas.length} ${resenas.length === 1 ? 'reseña' : 'reseñas'}; ${publicadas} ${publicadas === 1 ? 'está publicada' : 'están publicadas'}.`
        : 'Todavía no escribiste ninguna reseña.'}
    >
      <div className="cv-pila cv-gap-16" style={{ marginTop: 48 }}>
        {resenas.length === 0 ? (
          <div className="sec-tarjeta sec-vacio cv-pila cv-gap-16" style={{ alignItems: 'center' }}>
            <p className="sec-texto">Cuando atiendas a una profesional podés contar cómo te fue desde su perfil.</p>
            <a className="cv-boton cv-boton--primario" href="#/">Buscar profesionales</a>
          </div>
        ) : resenas.map((r) => <Tarjeta key={r.id} resena={r} />)}
      </div>
    </Pagina>
  );
}
