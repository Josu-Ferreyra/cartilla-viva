import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import { useApp } from '../core/store.jsx';
import { ESPECIALIDADES, ZONAS } from '../core/datos.js';
import { ESTADO_ANUNCIO, enDias } from '../core/formato.js';
import './secciones.css';

const FILTROS = [['pendiente', 'Pendientes'], ['aprobado', 'Aprobados'], ['rechazado', 'Rechazados']];
const NUEVO_VACIO = { titulo: '', texto: '', especialidad: ESPECIALIDADES[0], zona: ZONAS[0] };

function Aviso({ anuncio }) {
  const { estado, acciones } = useApp();
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const est = ESTADO_ANUNCIO[anuncio.estado];

  const rechazar = (ev) => {
    ev.preventDefault();
    acciones.resolverAnuncio({ id: anuncio.id, estado: 'rechazado', motivo });
    setRechazando(false);
    setMotivo('');
  };

  return (
    <article className="sec-tarjeta sec-aviso-item" aria-label={anuncio.titulo}>
      <div className="cv-fila cv-gap-8">
        <Chip tono={est.tono} chico>{est.texto}</Chip>
        <Chip tono="gris" chico>{anuncio.especialidad} · {anuncio.zona}</Chip>
        <span className="cv-meta" style={{ marginLeft: 'auto' }}>{enDias(anuncio.hora, estado.ahora)}</span>
      </div>
      <h2 className="sec-titulo-2">{anuncio.titulo}</h2>
      <p className="sec-aviso-item__texto">{anuncio.texto}</p>
      {anuncio.motivo && <p className="cv-meta" style={{ margin: 0 }}>Motivo del rechazo: {anuncio.motivo}</p>}

      {rechazando ? (
        <form className="cob-planes" onSubmit={rechazar}>
          <label className="cv-etiqueta" htmlFor={`motivo-${anuncio.id}`}>Motivo</label>
          <input id={`motivo-${anuncio.id}`} className="cob-input" style={{ width: 320, maxWidth: '100%' }} value={motivo} onChange={(ev) => setMotivo(ev.target.value)} placeholder="Ej.: promesa de resultados" autoFocus />
          <button type="submit" className="cv-boton cv-boton--chico cv-boton--primario">Rechazar aviso</button>
          <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => setRechazando(false)}>Cancelar</button>
        </form>
      ) : (
        <div className="cv-fila cv-gap-12">
          {anuncio.estado !== 'aprobado' && (
            <button type="button" className="cv-boton cv-boton--chico cv-boton--primario" onClick={() => acciones.resolverAnuncio({ id: anuncio.id, estado: 'aprobado' })}>Aprobar</button>
          )}
          {anuncio.estado === 'pendiente' && (
            <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => setRechazando(true)}>Rechazar</button>
          )}
          {anuncio.estado !== 'pendiente' && (
            <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => acciones.resolverAnuncio({ id: anuncio.id, estado: 'pendiente' })}>Volver a revisión</button>
          )}
        </div>
      )}
    </article>
  );
}

function FormularioNuevo({ onCargado }) {
  const { acciones } = useApp();
  const [nuevo, setNuevo] = useState(NUEVO_VACIO);
  const valido = nuevo.titulo.trim().length >= 3 && nuevo.texto.trim().length >= 10;
  const cambiar = (campo) => (ev) => setNuevo((n) => ({ ...n, [campo]: ev.target.value }));

  const enviar = (ev) => {
    ev.preventDefault();
    if (!valido) return;
    acciones.crearAnuncio(nuevo);
    setNuevo(NUEVO_VACIO);
    onCargado();
  };

  return (
    <form className="sec-tarjeta cv-pila cv-gap-16" onSubmit={enviar}>
      <h2 className="sec-titulo-2">Cargar un aviso</h2>
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="aviso-titulo">Título</label>
        <input id="aviso-titulo" className="sec-input" value={nuevo.titulo} onChange={cambiar('titulo')} maxLength={60} />
      </div>
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="aviso-texto">Texto</label>
        <textarea id="aviso-texto" className="sec-area" value={nuevo.texto} onChange={cambiar('texto')} maxLength={160} />
        <p className="sec-ayuda">Mínimo 10 caracteres. {nuevo.texto.length} / 160.</p>
      </div>
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="aviso-esp">Especialidad</label>
        <select id="aviso-esp" className="sec-select" value={nuevo.especialidad} onChange={cambiar('especialidad')}>
          {ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="aviso-zona">Zona</label>
        <select id="aviso-zona" className="sec-select" value={nuevo.zona} onChange={cambiar('zona')}>
          {ZONAS.map((z) => <option key={z}>{z}</option>)}
        </select>
      </div>
      <button type="submit" className="cv-boton cv-boton--primario" disabled={!valido}>Enviar a revisión</button>
    </form>
  );
}

export default function Avisos() {
  const { estado } = useApp();
  const [filtro, setFiltro] = useState('pendiente');
  const cuenta = (est) => estado.anuncios.filter((a) => a.estado === est).length;
  const lista = estado.anuncios.filter((a) => a.estado === filtro).sort((a, b) => b.hora - a.hora);

  return (
    <Pagina
      variante="operador"
      activo="Avisos"
      titulo="Avisos"
      subtitulo="Cada aviso lo revisa una persona antes de publicarse."
    >
      <div className="cv-columnas">
        <div className="cv-col-principal cv-pila cv-gap-16">
          <div className="sec-filtros" role="group" aria-label="Filtrar avisos">
            {FILTROS.map(([clave, texto]) => (
              <button key={clave} type="button" className="sec-filtro" aria-pressed={filtro === clave} onClick={() => setFiltro(clave)}>
                {texto} ({cuenta(clave)})
              </button>
            ))}
          </div>
          {lista.length === 0
            ? <div className="sec-tarjeta sec-vacio"><p className="sec-texto">No hay avisos en esta lista.</p></div>
            : lista.map((a) => <Aviso key={a.id} anuncio={a} />)}
        </div>
        <div className="cv-col-lateral">
          <FormularioNuevo onCargado={() => setFiltro('pendiente')} />
        </div>
      </div>
    </Pagina>
  );
}
