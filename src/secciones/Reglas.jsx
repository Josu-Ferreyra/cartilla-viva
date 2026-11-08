import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import { useApp } from '../core/store.jsx';
import { REGLAS_INICIALES } from '../core/datos.js';
import './secciones.css';

// Reglas que las pantallas del operador y los agentes ya aplican y que no se editan en la demo.
const FIJAS = [
  ['Plazo del operador', '48 h', 'Cada caso en la cola se resuelve dentro de las 48 h de haber entrado.'],
  ['Recordatorio a la profesional', 'Día 3', 'Si no responde la alerta de cobertura, A3 le recuerda al tercer día.'],
  ['Pase a la cola', 'Día 7', 'Sin respuesta a los 7 días, el caso pasa al operador, que llama al consultorio.'],
  ['Baja de una cobertura', 'Con confirmación', 'Nada se borra solo: lo confirma la profesional o lo decide una persona.'],
];

const entero = (texto) => (/^\d+$/.test(texto) ? Number(texto) : NaN);

export default function Reglas() {
  const { estado, acciones } = useApp();
  const actuales = { ...REGLAS_INICIALES, ...estado.reglas };
  const [umbral, setUmbral] = useState(String(actuales.umbralReportes));
  const [ventana, setVentana] = useState(String(actuales.ventanaDias));
  const [guardado, setGuardado] = useState(false);

  const u = entero(umbral);
  const v = entero(ventana);
  const validos = u >= 1 && u <= 10 && v >= 1 && v <= 30;
  const sucio = u !== actuales.umbralReportes || v !== actuales.ventanaDias;
  const porDefecto = actuales.umbralReportes === REGLAS_INICIALES.umbralReportes && actuales.ventanaDias === REGLAS_INICIALES.ventanaDias;

  const editar = (setter) => (ev) => { setter(ev.target.value); setGuardado(false); };
  const guardar = (ev) => {
    ev.preventDefault();
    if (!validos || !sucio) return;
    acciones.actualizarReglas({ umbralReportes: u, ventanaDias: v });
    setGuardado(true);
  };
  const restablecer = () => {
    acciones.actualizarReglas({ ...REGLAS_INICIALES });
    setUmbral(String(REGLAS_INICIALES.umbralReportes));
    setVentana(String(REGLAS_INICIALES.ventanaDias));
    setGuardado(true);
  };

  return (
    <Pagina
      variante="operador"
      activo="Reglas"
      titulo="Reglas"
      subtitulo="Cuándo los agentes proponen y cuándo interviene una persona."
    >
      <div className="cv-columnas">
        <div className="cv-col-principal cv-pila cv-gap-24">
          <form className="sec-tarjeta cv-pila cv-gap-24" onSubmit={guardar} noValidate>
            <div>
              <h2 className="sec-titulo-2">Cuándo se abre una disputa</h2>
              <p className="sec-texto" style={{ marginTop: 8 }}>
                Si A3 ve a la profesional en la cartilla pero varios pacientes dicen que no atiende esa cobertura, A1 y A3 no coinciden y el caso pasa al operador.
              </p>
            </div>
            <div className="sec-grilla-2">
              <div className="sec-campo">
                <label className="cv-etiqueta" htmlFor="regla-umbral">Pacientes que reportan</label>
                <input id="regla-umbral" className="sec-input sec-numero" inputMode="numeric" value={umbral} onChange={editar(setUmbral)} aria-invalid={Number.isNaN(u) || u < 1 || u > 10 ? 'true' : undefined} />
                <p className="sec-ayuda">Entre 1 y 10. Se cuentan pacientes distintos.</p>
              </div>
              <div className="sec-campo">
                <label className="cv-etiqueta" htmlFor="regla-ventana">En una ventana de (días)</label>
                <input id="regla-ventana" className="sec-input sec-numero" inputMode="numeric" value={ventana} onChange={editar(setVentana)} aria-invalid={Number.isNaN(v) || v < 1 || v > 30 ? 'true' : undefined} />
                <p className="sec-ayuda">Entre 1 y 30 días.</p>
              </div>
            </div>
            <p className="sec-texto" aria-live="polite">
              {validos
                ? <>Con estos valores, <strong>{u} {u === 1 ? 'paciente' : 'pacientes'} en {v} {v === 1 ? 'día' : 'días'}</strong> abren una disputa.</>
                : 'Revisá los valores: tienen que ser números dentro de los rangos indicados.'}
            </p>
            <div className="cv-fila cv-gap-12">
              <button type="submit" className="cv-boton cv-boton--primario" disabled={!validos || !sucio}>Guardar reglas</button>
              <button type="button" className="cv-boton cv-boton--secundario" disabled={porDefecto && !sucio} onClick={restablecer}>Restablecer</button>
            </div>
            {guardado && !sucio && (
              <div className="cv-aviso cv-aviso--menta" role="status">
                <p className="cv-aviso__titulo">Listo: las reglas nuevas se aplican desde el próximo reporte.</p>
              </div>
            )}
          </form>
        </div>

        <aside className="cv-col-lateral cv-pila cv-gap-16" aria-label="Reglas fijas">
          <h2 className="cv-eyebrow">Fijas en esta demo</h2>
          {FIJAS.map(([nombre, valor, detalle]) => (
            <div key={nombre} className="sec-tarjeta sec-tarjeta--chica sec-regla">
              <span className="cv-meta">{nombre}</span>
              <span className="sec-regla__valor">{valor}</span>
              <p className="sec-ayuda">{detalle}</p>
            </div>
          ))}
        </aside>
      </div>
    </Pagina>
  );
}
