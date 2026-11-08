import { useState } from 'react';
import { useApp, selProf } from '../../core/store.jsx';
import { haceTiempo } from '../../core/formato.js';
import { reportesDe, pacientesDistintos, separarPlanes, unirPlanes } from './utilidades.js';
import './coberturas.css';

function resumenDecision(caso, cob) {
  const os = caso.obraSocial;
  if (caso.decision === 'sacar') return `Se sacó ${os} del perfil (D7).`;
  if (caso.decision === 'corregir') return `No se saca: se corrigió a plan ${unirPlanes(cob?.planes)} (D7).`;
  return `No se saca: ${os} sigue verificada (D7).`;
}

export default function DetalleDisputa({ caso }) {
  const { estado, acciones } = useApp();
  const os = caso.obraSocial;
  const [decision, setDecision] = useState('corregir');
  const [planes, setPlanes] = useState('210');
  const [nota, setNota] = useState(`Atiende ${os}, pero solo el plan 210.`);
  const prof = selProf(estado, caso.profId);
  const cob = prof?.coberturas.find((c) => c.obraSocial === os);
  const ahora = estado.ahora;
  const nReportes = pacientesDistintos(reportesDe(estado, caso.profId, os, ahora - 168));
  const listaPlanes = separarPlanes(planes);
  const sinPlanes = decision === 'corregir' && listaPlanes.length === 0;

  const opciones = [
    { valor: 'sacar', texto: `Sacar ${os} del perfil` },
    { valor: 'mantener', texto: `Mantener ${os} como está` },
    { valor: 'corregir', texto: 'Corregir: atiende solo el plan' },
  ];
  const textoAccion = {
    sacar: `Aceptar: sacar ${os}`,
    mantener: 'Rechazar la propuesta y mantener',
    corregir: 'Rechazar la propuesta y corregir',
  }[decision];

  const resolver = () =>
    acciones.resolverDisputa({
      casoId: caso.id,
      decision,
      planes: decision === 'corregir' ? listaPlanes : null,
      nota: nota.trim(),
    });

  return (
    <>
      <div>
        <p className="cv-meta" style={{ margin: 0 }}>
          Propuesta de A3 · Verificador: <strong>sacar {os} del perfil</strong>
        </p>
        <h2 className="cv-titulo-2" style={{ marginTop: 10 }}>{prof?.nombre} · {os}</h2>
      </div>

      {caso.estado === 'abierto' ? (
        <>
          <div className="cob-contradiccion">
            <div className="cob-bloque cob-bloque--menta">
              <p className="cob-rotulo">A3 · Verificador</p>
              <p className="cob-valor">Atiende {os}</p>
              <p className="cob-detalle">La cartilla, leída {haceTiempo(cob?.verificadaEn, ahora)}, la incluye.</p>
            </div>
            <div className="cob-bloque cob-bloque--durazno">
              <p className="cob-rotulo">A1 · Buscador</p>
              <p className="cob-valor">{nReportes} reportes en 7 días</p>
              <p className="cob-detalle">«No atiende mi cobertura», de pacientes distintos.</p>
            </div>
          </div>

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

          <fieldset className="cob-decision">
            <legend className="cv-etiqueta">Qué hacemos con el dato</legend>
            {opciones.map((op) => (
              <label key={op.valor} className={`cob-opcion${decision === op.valor ? ' cob-opcion--activa' : ''}`}>
                <input
                  type="radio"
                  name={`decision-${caso.id}`}
                  value={op.valor}
                  checked={decision === op.valor}
                  onChange={() => setDecision(op.valor)}
                />
                <span>{op.texto}</span>
                {op.valor === 'corregir' && (
                  <input
                    className="cob-input"
                    aria-label="Planes que atiende"
                    value={planes}
                    onChange={(ev) => setPlanes(ev.target.value)}
                    onFocus={() => setDecision('corregir')}
                  />
                )}
              </label>
            ))}
          </fieldset>

          <div className="cv-fila cv-gap-12">
            <button type="button" className="cv-boton cv-boton--primario" disabled={sinPlanes} onClick={resolver}>
              {textoAccion}
            </button>
            <span className="cv-meta" style={{ flex: '1 1 260px' }}>
              Mientras tanto el paciente ve: «Cobertura en disputa: confirmala con el consultorio antes de ir».
            </span>
          </div>
        </>
      ) : (
        <div className="cv-aviso cv-aviso--menta" role="status">
          <p className="cv-aviso__titulo">{resumenDecision(caso, cob)}</p>
        </div>
      )}
    </>
  );
}
