import { useState } from 'react';
import { useApp, selProf } from '../../core/store.jsx';
import { haceTiempo, diaDeSiete } from '../../core/formato.js';
import { reportesDe, pacientesDistintos, pacientes, unirPlanes } from './utilidades.js';
import './coberturas.css';

function Dato({ rotulo, valor, detalle }) {
  return (
    <div className="cob-dato">
      <p className="cob-rotulo">{rotulo}</p>
      <p className="cob-valor">{valor}</p>
      <p className="cob-detalle">{detalle}</p>
    </div>
  );
}

function resumenDecision(caso, cob) {
  const os = caso.obraSocial;
  switch (caso.decision) {
    case 'baja_profesional': return 'La profesional confirmó la baja (D3).';
    case 'baja_operador': return 'El operador confirmó la baja (D6).';
    case 'mantener': return `Se mantuvo ${os}.`;
    case 'planes': return `Se guardaron los planes ${unirPlanes(cob?.planes)}.`;
    default: return 'Caso resuelto.';
  }
}

export default function DetalleSinConfirmar({ caso }) {
  const { estado, acciones } = useApp();
  const [llamando, setLlamando] = useState(false);
  const [nota, setNota] = useState('');
  const prof = selProf(estado, caso.profId);
  const cob = prof?.coberturas.find((c) => c.obraSocial === caso.obraSocial);
  const os = caso.obraSocial;
  const ahora = estado.ahora;

  const reportes = reportesDe(estado, caso.profId, os);
  const nReportes = pacientesDistintos(reportes);
  const ultimo = reportes.length ? Math.max(...reportes.map((r) => r.hora)) : null;
  const horas = ahora - caso.creado;

  const campoNota = (
    <div className="cob-campo-nota">
      <label className="cv-etiqueta" htmlFor={`nota-${caso.id}`}>Registro de la llamada al consultorio</label>
      <textarea
        id={`nota-${caso.id}`}
        className="cv-campo"
        rows={2}
        value={nota}
        onChange={(ev) => setNota(ev.target.value)}
      />
    </div>
  );

  const decidir = (decision) => acciones.confirmarDecisionOperador({ casoId: caso.id, decision, nota: nota.trim() });

  return (
    <>
      <div>
        <p className="cv-meta" style={{ margin: 0 }}>
          Propuesta de A3 · Verificador: <strong>sacar {os} del perfil</strong>
        </p>
        <h2 className="cv-titulo-2" style={{ marginTop: 10 }}>{prof?.nombre} · {os}</h2>
      </div>

      <div className="cob-evidencia-grilla">
        <Dato rotulo={`Cartilla ${os}`} valor="No figura" detalle={`leída ${haceTiempo(caso.creado, ahora)}`} />
        {nReportes > 0 ? (
          <Dato rotulo="Reportes" valor={pacientes(nReportes)} detalle={`el último ${haceTiempo(ultimo, ahora)}`} />
        ) : (
          <Dato rotulo="Reportes" valor="Sin reportes" detalle="lo detectó A3" />
        )}
        <Dato
          rotulo="Perfil"
          valor={`${os} declarada`}
          detalle={cob?.verificadaEn != null ? `verificada ${haceTiempo(cob.verificadaEn, ahora)}` : 'nunca verificada'}
        />
      </div>

      {caso.etapa === 'esperando_profesional' && (
        <>
          <div className="cv-pila cv-gap-16">
            <h3 className="cv-eyebrow">Plazo de la profesional</h3>
            <div
              className="cob-barra"
              role="progressbar"
              aria-label="Plazo de la profesional"
              aria-valuemin={0}
              aria-valuemax={7}
              aria-valuenow={Math.min(7, Math.max(0, Math.floor(horas / 24)))}
            >
              <div className="cob-barra__relleno" style={{ width: `${Math.min(100, Math.max(0, (horas / 168) * 100))}%` }} />
            </div>
            <p className="cv-texto" style={{ margin: 0 }}>
              {diaDeSiete(caso, ahora)} · recordatorio el día 3 · después pasa a esta cola para llamar al consultorio.
            </p>
          </div>

          {llamando && campoNota}

          <div className="cv-fila cv-gap-16">
            <button type="button" className="cv-boton cv-boton--secundario" onClick={() => setLlamando(true)}>
              Llamar al consultorio
            </button>
            <button type="button" className="cv-boton cv-boton--primario" disabled>
              Confirmar baja
            </button>
            <span className="cv-meta" style={{ flex: '1 1 260px' }}>
              La baja la confirma la profesional. El operador decide solo si ella no responde o los datos se contradicen.
            </span>
          </div>
        </>
      )}

      {caso.etapa === 'cola_operador' && (
        <>
          {campoNota}
          <div className="cv-fila cv-gap-12">
            <button type="button" className="cv-boton cv-boton--primario" onClick={() => decidir('baja')}>
              Confirmar baja
            </button>
            <button type="button" className="cv-boton cv-boton--secundario" onClick={() => decidir('mantener')}>
              Mantener {os}
            </button>
          </div>
        </>
      )}

      {caso.estado === 'resuelto' && (
        <div className="cv-aviso cv-aviso--menta" role="status">
          <p className="cv-aviso__titulo">{resumenDecision(caso, cob)}</p>
        </div>
      )}
    </>
  );
}
