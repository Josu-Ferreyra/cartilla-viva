import { useMemo, useState } from 'react';
import Header from '../../componentes/Header.jsx';
import Chip from '../../componentes/Chip.jsx';
import Avatar from '../../componentes/Avatar.jsx';
import Selector from '../../componentes/Selector.jsx';
import { useApp } from '../../core/store.jsx';
import { ESPECIALIDADES, COBERTURAS, ZONAS, BUSQUEDA_INICIAL } from '../../core/datos.js';
import { ESTADO_COBERTURA, numero, iniciales } from '../../core/formato.js';
import { buscar, anunciosPara } from './buscador.js';
import { textoChipBusqueda, resultados } from './textos.js';
import './paciente.css';

// Última búsqueda aplicada: «← Volver a resultados» vuelve a los mismos filtros. Un F5 la reinicia.
let ultimaBusqueda = BUSQUEDA_INICIAL;

const CAMPOS = [
  { clave: 'especialidad', rotulo: 'Especialidad', opciones: ESPECIALIDADES },
  { clave: 'cobertura', rotulo: 'Cobertura', opciones: COBERTURAS },
  { clave: 'zona', rotulo: 'Zona', opciones: ZONAS },
];

function FilaResultado({ prof, cob, ahora }) {
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
        <strong>{numero(prof.rating)}</strong> · {prof.cantResenas}
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

  const lista = useMemo(() => buscar(estado.profesionales, filtros), [estado.profesionales, filtros]);
  const anuncios = anunciosPara(estado.anuncios, filtros);

  const aplicar = (ev) => {
    ev.preventDefault();
    ultimaBusqueda = borrador;
    setFiltros(borrador);
  };

  return (
    <div className="cv-pagina">
      <Header variante="paciente" activo="Buscar" />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1">¿A quién necesitás ver?</h1>
        <p className="cv-subtitulo">Cruzamos cobertura, especialidad y zona. Cada dato muestra cuándo lo verificamos.</p>

        <form className="pac-barra" onSubmit={aplicar} role="search">
          {CAMPOS.map((campo) => (
            <label key={campo.clave} className="pac-campo">
              <span className="pac-campo__rotulo">{campo.rotulo}</span>
              <Selector
                variante="barra"
                value={borrador[campo.clave]}
                opciones={campo.opciones}
                onChange={(valor) => setBorrador((b) => ({ ...b, [campo.clave]: valor }))}
              />
            </label>
          ))}
          <button type="submit" className="cv-boton cv-boton--primario">Buscar</button>
        </form>

        <div className="pac-columnas">
          <section className="pac-resultados" aria-label="Resultados">
            <div className="pac-resultados__encabezado">
              <h2 className="pac-resultados__titulo" aria-live="polite">{resultados(lista.length)}</h2>
              <span className="cv-meta">Ordenados por cobertura verificada y cercanía</span>
            </div>
            {lista.length > 0 ? (
              <ol className="pac-lista">
                {lista.map(({ prof, cob }) => (
                  <li key={prof.id}><FilaResultado prof={prof} cob={cob} ahora={estado.ahora} /></li>
                ))}
              </ol>
            ) : (
              <p className="cv-tarjeta pac-vacio">No encontramos profesionales con esos filtros. Probá con otra zona.</p>
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
