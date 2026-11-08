import { useEffect, useState } from 'react';
import { useApp } from '../../core/store.jsx';
import { horaDemo } from '../../core/formato.js';
import { irA } from '../../core/ruta.js';
import './coberturas.css';

const DESTINOS = [
  { texto: 'Paciente: búsqueda', href: '#/' },
  { texto: 'Perfil Dra. Ruiz', href: '#/perfil/ruiz' },
  { texto: 'Reseña', href: '#/resena/ruiz' },
  { texto: 'Profesional', href: '#/profesional/ruiz' },
  { texto: 'Operador', href: '#/operador' },
];

export default function PanelPresentador() {
  const { estado, acciones } = useApp();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const cerrar = () => { setAbierto(false); setConfirmando(false); };

  // La confirmación de «Reiniciar» vence sola si no se completa.
  useEffect(() => {
    if (!confirmando) return undefined;
    const t = setTimeout(() => setConfirmando(false), 4000);
    return () => clearTimeout(t);
  }, [confirmando]);

  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (ev) => { if (ev.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  const reiniciar = () => {
    if (!confirmando) { setConfirmando(true); return; }
    acciones.reiniciar();
    irA('/');
    setConfirmando(false);
  };

  return (
    <div className="cob-presentador">
      {abierto && (
        <section id="cob-panel-presentador" className="cob-presentador__panel" aria-label="Panel del presentador">
          <div className="cob-presentador__cabecera">
            <h2 className="cv-eyebrow">Panel de demo</h2>
            <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={cerrar}>Cerrar</button>
          </div>

          <div className="cob-presentador__seccion">
            <h3 className="cv-eyebrow">Ir a</h3>
            <nav className="cob-presentador__links" aria-label="Pantallas de la demo">
              {DESTINOS.map((d) => <a key={d.href} href={d.href}>{d.texto}</a>)}
            </nav>
          </div>

          <div className="cob-presentador__seccion">
            <h3 className="cv-eyebrow">Tiempo</h3>
            <p className="cv-meta" style={{ margin: 0 }}>Ahora: {horaDemo(estado.ahora)}</p>
            <div className="cob-presentador__acciones">
              <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => acciones.avanzarHoras(24)}>+1 día</button>
              <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => acciones.avanzarHoras(168)}>+7 días</button>
            </div>
          </div>

          <div className="cob-presentador__seccion">
            <h3 className="cv-eyebrow">Agentes</h3>
            <div className="cob-presentador__acciones">
              <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => acciones.ejecutarVerificacion()}>Ejecutar verificación de A3</button>
              <button type="button" className="cv-boton cv-boton--chico cv-boton--secundario" onClick={() => acciones.reportarNoAtiende({ profId: 'ruiz', obraSocial: 'OSEP' })}>Simular 1 reporte</button>
            </div>
          </div>

          <div className="cob-presentador__seccion">
            <h3 className="cv-eyebrow">Reiniciar demo</h3>
            <div className="cob-presentador__acciones">
              <button
                type="button"
                className={`cv-boton cv-boton--chico cv-boton--secundario${confirmando ? ' cob-presentador__reiniciar--confirmar' : ''}`}
                onClick={reiniciar}
              >
                {confirmando ? '¿Seguro? Tocá de nuevo' : 'Reiniciar demo'}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        className="cv-boton cv-boton--chico cob-presentador__boton"
        aria-expanded={abierto}
        aria-controls="cob-panel-presentador"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        Demo · {horaDemo(estado.ahora)}
      </button>
    </div>
  );
}
