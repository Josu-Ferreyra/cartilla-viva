import { useState } from 'react';
import Header from '../../componentes/Header.jsx';
import Chip from '../../componentes/Chip.jsx';
import NoEncontrada from '../../componentes/NoEncontrada.jsx';
import { useApp, selProf, selCaso, selAlertasPendientes } from '../../core/store.jsx';
import { ESTADO_COBERTURA, haceTiempo, diaDeSiete, numero } from '../../core/formato.js';
import { reportesDe, pacientesDistintos, primerNombre, separarPlanes, unirPlanes } from './utilidades.js';
import './coberturas.css';

function textoRespuesta({ respuesta, planes, obraSocial }) {
  if (respuesta === 'baja') return `Listo: sacamos ${obraSocial} de tu perfil.`;
  if (respuesta === 'planes') return `Listo: guardamos los planes ${unirPlanes(planes)}.`;
  return 'Gracias: un operador va a revisar el dato.';
}

function TarjetaAlerta({ alerta, onResponder }) {
  const { estado, acciones } = useApp();
  const [pidePlanes, setPidePlanes] = useState(false);
  const [planes, setPlanes] = useState('');
  const os = alerta.obraSocial;
  const caso = selCaso(estado, alerta.casoId);
  const nPacientes = pacientesDistintos(reportesDe(estado, alerta.profId, os));

  const responder = (respuesta, extra) => {
    acciones.responderAlerta({ alertaId: alerta.id, respuesta, ...extra });
    onResponder({ respuesta, obraSocial: os, planes: extra?.planes });
  };
  const guardarPlanes = (ev) => {
    ev.preventDefault();
    const lista = separarPlanes(planes);
    if (lista.length) responder('planes', { planes: lista });
  };

  return (
    <section className="cv-panel cv-pila cv-gap-32" aria-label={`Cobertura de ${os}`}>
      <div className="cv-fila cv-gap-8">
        <Chip tono="manteca">Cobertura de {os}</Chip>
        {caso && <Chip tono="gris">{diaDeSiete(caso, estado.ahora)}</Chip>}
      </div>

      <h2 className="cob-pregunta">¿Sacamos {os} de tu perfil?</h2>

      <ul className="cv-pila cob-evidencia">
        <li>
          <span className="cv-punto cv-punto--manteca" aria-hidden="true" />
          <span>La cartilla de {os}, leída {haceTiempo(caso?.creado ?? alerta.creada, estado.ahora)}, ya no te incluye.</span>
        </li>
        {nPacientes > 0 && (
          <li>
            <span className="cv-punto cv-punto--manteca" aria-hidden="true" />
            <span>
              {nPacientes === 1
                ? `1 paciente reportó que en el consultorio ya no toman ${os}.`
                : `${nPacientes} pacientes reportaron que en el consultorio ya no toman ${os}.`}
            </span>
          </li>
        )}
      </ul>

      <div className="cv-fila cv-gap-12">
        <button type="button" className="cv-boton cv-boton--primario" onClick={() => responder('baja')}>
          Sí, ya no atiendo {os}
        </button>
        <button type="button" className="cv-boton cv-boton--secundario" onClick={() => responder('sigue')}>
          No, sigo atendiendo {os}
        </button>
        {!pidePlanes && (
          <button type="button" className="cv-boton cv-boton--enlace" onClick={() => setPidePlanes(true)}>
            Solo algunos planes
          </button>
        )}
      </div>

      {pidePlanes && (
        <form className="cob-planes" onSubmit={guardarPlanes}>
          <label className="cv-etiqueta" htmlFor={`planes-${alerta.id}`}>¿Qué planes atendés?</label>
          <input
            id={`planes-${alerta.id}`}
            className="cob-input"
            value={planes}
            onChange={(ev) => setPlanes(ev.target.value)}
            placeholder="210, 310"
            autoFocus
          />
          <button type="submit" className="cv-boton cv-boton--secundario" disabled={!separarPlanes(planes).length}>
            Guardar
          </button>
        </form>
      )}

      <p className="cv-meta cob-nota">
        Mientras no respondas, {os} se muestra como «sin confirmar». No borramos ningún dato sin tu confirmación.
        Si no respondés en 7 días, una persona del equipo te llama.
      </p>
    </section>
  );
}

function Resumen({ prof }) {
  return (
    <aside className="cv-col-lateral cv-pila cv-gap-16" aria-label="Tu perfil">
      <h2 className="cv-eyebrow">Tu perfil</h2>
      <div className="cob-lateral-tarjeta cv-lista-filas">
        <div className="cob-fila-perfil">
          <span>Estado</span>
          <Chip tono="menta">Publicado</Chip>
        </div>
        {prof.coberturas.filter((c) => c.obraSocial !== 'Particular').map((c) => (
          <div key={c.obraSocial} className="cob-fila-perfil">
            <span>{c.obraSocial}</span>
            <Chip tono={ESTADO_COBERTURA[c.estado].tono}>{ESTADO_COBERTURA[c.estado].texto}</Chip>
          </div>
        ))}
        <div className="cob-fila-perfil">
          <span>Reseñas</span>
          <span style={{ fontWeight: 600 }}>{numero(prof.rating)} · {prof.cantResenas}</span>
        </div>
      </div>
    </aside>
  );
}

export default function Profesional({ profId }) {
  const { estado } = useApp();
  // Al responder, la alerta deja de estar pendiente: el aviso se guarda acá para mostrarlo.
  const [respondida, setRespondida] = useState(null);
  const prof = selProf(estado, profId);
  if (!prof) return <NoEncontrada />;

  const pendientes = selAlertasPendientes(estado, profId);
  const alerta = pendientes[0];

  return (
    <div className="cv-pagina">
      <Header variante="profesional" activo="Alertas" />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1">Hola, {primerNombre(prof.nombre)}</h1>
        <p className="cv-subtitulo">
          {alerta ? 'Tenés un dato de tu perfil para revisar.' : 'Tu perfil está al día.'}
        </p>

        <div className="cv-columnas">
          <div className="cv-col-principal cv-pila cv-gap-24">
            {respondida && (
              <div className="cv-aviso cv-aviso--menta" role="status">
                <p className="cv-aviso__titulo">{textoRespuesta(respondida)}</p>
              </div>
            )}
            {alerta ? (
              <TarjetaAlerta key={alerta.id} alerta={alerta} onResponder={setRespondida} />
            ) : !respondida && (
              <div className="cv-panel cv-pila cv-gap-16">
                <p className="cv-texto" style={{ margin: 0 }}>No tenés datos para revisar.</p>
                <p className="cv-meta" style={{ margin: 0 }}>Te avisamos si una cartilla deja de coincidir con tu perfil.</p>
              </div>
            )}
          </div>
          <Resumen prof={prof} />
        </div>
      </main>
    </div>
  );
}
