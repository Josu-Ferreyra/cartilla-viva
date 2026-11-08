import { Fragment, useMemo, useState } from 'react';
import Header from '../../componentes/Header.jsx';
import Chip from '../../componentes/Chip.jsx';
import Avatar from '../../componentes/Avatar.jsx';
import Selector from '../../componentes/Selector.jsx';
import { useApp, selResumenResenas } from '../../core/store.jsx';
import { ESPECIALIDADES, COBERTURAS, ZONAS, TODOS, BUSQUEDA_INICIAL } from '../../core/datos.js';
import { ESTADO_COBERTURA, numero, puntaje, iniciales } from '../../core/formato.js';
import { buscar, anunciosPara, ORDENES } from './buscador.js';
import { textoChipBusqueda, resultados } from './textos.js';
import './paciente.css';

// Última búsqueda aplicada: «← Volver a resultados» vuelve a los mismos filtros. Un F5 la reinicia.
let ultimaBusqueda = BUSQUEDA_INICIAL;
let ultimoOrden = 'relevancia';

const CAMPOS = [
  { clave: 'especialidad', rotulo: 'Especialidad', opciones: [TODOS, ...ESPECIALIDADES] },
  { clave: 'cobertura', rotulo: 'Cobertura', opciones: [TODOS, ...COBERTURAS] },
  { clave: 'zona', rotulo: 'Zona', opciones: [TODOS, ...ZONAS] },
];
const ROTULOS_ORDEN = Object.values(ORDENES);

function FilaResultado({ prof, cob, ahora, resumen }) {
  return (
    <article className="cv-tarjeta pac-fila">
      <Avatar iniciales={iniciales(prof.nombre)} tono={prof.avatar} tam={52} />
      <div className="pac-fila__datos">
        <h3 className="pac-fila__nombre">{prof.nombre}</h3>
        <p className="cv-meta pac-fila__meta">
          {prof.titulo} · {prof.zona}, {prof.barrio} · {numero(prof.km)} km
        </p>
      </div>
      <Chip tono={ESTADO_COBERTURA[cob.estado].tono}>{textoChipBusqueda(cob, ahora)}</Chip>
      <p className="cv-meta pac-puntaje">
        <strong>{puntaje(resumen.rating)}</strong> · {resumen.cantidad}
        <span className="cv-sr"> reseñas</span>
      </p>
      <a className="pac-ver-perfil" href={`#/perfil/${prof.id}`}>
        Ver perfil →<span className="cv-sr"> de {prof.nombre}</span>
      </a>
    </article>
  );
}

export default function Busqueda() {
  const { estado } = useApp();
  const [borrador, setBorrador] = useState(ultimaBusqueda);
  const [filtros, setFiltros] = useState(ultimaBusqueda);
  const [orden, setOrden] = useState(ultimoOrden);

  const lista = useMemo(
    () => buscar(estado.profesionales, filtros, orden, (id) => selResumenResenas(estado, id)),
    [estado, filtros, orden],
  );
  const anuncios = anunciosPara(estado.anuncios, filtros);

  const aplicar = (ev) => {
    ev.preventDefault();
    // El plan solo tiene sentido dentro de una obra social puntual
    const aplicado = borrador.cobertura === TODOS ? { ...borrador, plan: '' } : borrador;
    ultimaBusqueda = aplicado;
    setFiltros(aplicado);
  };

  const cambiarOrden = (rotulo) => {
    const clave = Object.keys(ORDENES).find((k) => ORDENES[k] === rotulo);
    ultimoOrden = clave;
    setOrden(clave);
  };

  return (
    <div className="cv-pagina">
      <Header variante="paciente" activo="Buscar" />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1">¿A quién necesitás ver?</h1>
        <p className="cv-subtitulo">Cruzamos cobertura, especialidad y zona. Cada dato muestra cuándo lo verificamos.</p>

        <form className="pac-barra" onSubmit={aplicar} role="search">
          <label className="pac-campo">
            <span className="pac-campo__rotulo">Nombre</span>
            <input
              type="search"
              className="pac-campo__input"
              value={borrador.nombre}
              placeholder="Ej.: Ruiz"
              autoComplete="off"
              onChange={(ev) => setBorrador((b) => ({ ...b, nombre: ev.target.value }))}
            />
          </label>
          {CAMPOS.map((campo) => (
            <Fragment key={campo.clave}>
              <label className="pac-campo">
                <span className="pac-campo__rotulo">{campo.rotulo}</span>
                <Selector
                  variante="barra"
                  value={borrador[campo.clave]}
                  opciones={campo.opciones}
                  onChange={(valor) => setBorrador((b) => ({ ...b, [campo.clave]: valor }))}
                />
              </label>
              {campo.clave === 'cobertura' && borrador.cobertura !== TODOS && (
                <label className="pac-campo">
                  <span className="pac-campo__rotulo">Plan de {borrador.cobertura}</span>
                  <input
                    type="text"
                    className="pac-campo__input"
                    value={borrador.plan}
                    placeholder="Ej.: 310 (opcional)"
                    autoComplete="off"
                    onChange={(ev) => setBorrador((b) => ({ ...b, plan: ev.target.value }))}
                  />
                </label>
              )}
            </Fragment>
          ))}
          <button type="submit" className="cv-boton cv-boton--primario">Buscar</button>
        </form>

        <div className="pac-columnas">
          <section className="pac-resultados" aria-label="Resultados">
            <div className="pac-resultados__encabezado">
              <h2 className="pac-resultados__titulo" aria-live="polite">{resultados(lista.length)}</h2>
              <label className="pac-orden">
                <span className="cv-meta">Ordenar por</span>
                <Selector variante="orden" value={ORDENES[orden]} opciones={ROTULOS_ORDEN} onChange={cambiarOrden} aria-label="Ordenar resultados" />
              </label>
            </div>
            {lista.length > 0 ? (
              <ol className="pac-lista">
                {lista.map(({ prof, cob }) => (
                  <li key={prof.id}><FilaResultado prof={prof} cob={cob} ahora={estado.ahora} resumen={selResumenResenas(estado, prof.id)} /></li>
                ))}
              </ol>
            ) : (
              <p className="cv-tarjeta pac-vacio">No encontramos profesionales con esos filtros. Probá con otros filtros.</p>
            )}
          </section>

          <aside className="pac-lateral">
            {anuncios.map((an) => (
              <div key={an.id} className="pac-anuncio">
                <p className="cv-eyebrow">Anuncio · fuera del ranking</p>
                <p className="pac-anuncio__titulo">{an.titulo}</p>
                <p className="cv-meta pac-anuncio__texto">{an.texto}</p>
              </div>
            ))}
            <div className="pac-leyenda">
              <p className="cv-eyebrow">Estados de cobertura</p>
              <p className="pac-leyenda__fila"><span className="pac-punto cv-punto--menta" aria-hidden="true" />Verificada en la cartilla</p>
              <p className="pac-leyenda__fila"><span className="pac-punto cv-punto--manteca" aria-hidden="true" />Sin confirmar</p>
              <p className="pac-leyenda__fila"><span className="pac-punto cv-punto--durazno" aria-hidden="true" />En disputa</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
