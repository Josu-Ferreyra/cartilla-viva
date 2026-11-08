import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import NoEncontrada from '../componentes/NoEncontrada.jsx';
import { useApp, selProf, selPerfil, selAlertasPendientes } from '../core/store.jsx';
import { ESTADO_COBERTURA, ESTADO_MATRICULA, enDias } from '../core/formato.js';
import './secciones.css';

const MODALIDADES = ['Presencial', 'Online', 'Presencial y online'];
const MAX_BIO = 400;

function validar(b) {
  const e = {};
  if (b.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Ingresá un teléfono con al menos 8 dígitos.';
  if (b.direccion.trim().length < 5) e.direccion = 'Ingresá la dirección del consultorio.';
  if (b.honorario !== '' && !/^\d+$/.test(b.honorario)) e.honorario = 'Solo números, sin puntos ni signos.';
  return e;
}

function Formulario({ perfil, profId }) {
  const { acciones } = useApp();
  const [borrador, setBorrador] = useState(perfil);
  const [guardado, setGuardado] = useState(false);
  const errores = validar(borrador);
  const hayErrores = Object.keys(errores).length > 0;
  const sucio = JSON.stringify(borrador) !== JSON.stringify(perfil);

  const cambiar = (campo) => (ev) => {
    const valor = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setBorrador((b) => ({ ...b, [campo]: valor }));
    setGuardado(false);
  };
  const guardar = (ev) => {
    ev.preventDefault();
    if (hayErrores || !sucio) return;
    acciones.actualizarPerfil({ profId, cambios: borrador });
    setGuardado(true);
  };
  const descartar = () => { setBorrador(perfil); setGuardado(false); };

  const campo = (id, etiqueta, props) => (
    <div className="sec-campo">
      <label className="cv-etiqueta" htmlFor={`perfil-${id}`}>{etiqueta}</label>
      <input
        id={`perfil-${id}`}
        className="sec-input"
        value={borrador[id]}
        onChange={cambiar(id)}
        aria-invalid={errores[id] ? 'true' : undefined}
        aria-describedby={errores[id] ? `perfil-${id}-error` : undefined}
        {...props}
      />
      {errores[id] && <p id={`perfil-${id}-error`} className="sec-error">{errores[id]}</p>}
    </div>
  );

  return (
    <form className="sec-tarjeta cv-pila cv-gap-24" onSubmit={guardar} noValidate>
      <h2 className="sec-titulo-2">Datos del consultorio</h2>
      <div className="sec-grilla-2">
        {campo('telefono', 'Teléfono', { type: 'tel', inputMode: 'tel' })}
        {campo('honorario', 'Honorario de la consulta (ARS)', { inputMode: 'numeric', placeholder: '25000' })}
      </div>
      {campo('direccion', 'Dirección')}
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="perfil-modalidad">Modalidad</label>
        <select id="perfil-modalidad" className="sec-select" value={borrador.modalidad} onChange={cambiar('modalidad')}>
          {MODALIDADES.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="sec-campo">
        <label className="cv-etiqueta" htmlFor="perfil-bio">Presentación</label>
        <textarea id="perfil-bio" className="sec-area" value={borrador.bio} maxLength={MAX_BIO} onChange={cambiar('bio')} />
        <p className="sec-ayuda">{borrador.bio.length} / {MAX_BIO}. La ven los pacientes en tu perfil.</p>
      </div>
      <label className="sec-interruptor">
        <input type="checkbox" checked={borrador.aceptaNuevos} onChange={cambiar('aceptaNuevos')} />
        Estoy aceptando pacientes nuevos
      </label>

      <div className="cv-fila cv-gap-12">
        <button type="submit" className="cv-boton cv-boton--primario" disabled={!sucio || hayErrores}>Guardar cambios</button>
        <button type="button" className="cv-boton cv-boton--secundario" disabled={!sucio} onClick={descartar}>Descartar</button>
      </div>
      {guardado && !sucio && (
        <div className="cv-aviso cv-aviso--menta" role="status">
          <p className="cv-aviso__titulo">Listo: guardamos los cambios de tu perfil.</p>
        </div>
      )}
    </form>
  );
}

export default function MiPerfil() {
  const { estado } = useApp();
  const prof = selProf(estado, estado.profesionalActual);
  if (!prof) return <NoEncontrada />;

  const perfil = selPerfil(estado, prof.id);
  const mat = estado.matriculas[prof.id];
  const pendientes = selAlertasPendientes(estado, prof.id).length;

  return (
    <Pagina variante="profesional" activo="Mi perfil" titulo="Mi perfil" subtitulo={`${prof.nombre} · ${prof.titulo} · ${prof.zona}`}>
      <div className="cv-columnas">
        <div className="cv-col-principal">
          <Formulario perfil={perfil} profId={prof.id} />
        </div>

        <aside className="cv-col-lateral cv-pila cv-gap-16" aria-label="Estado del perfil">
          <h2 className="cv-eyebrow">Estado del perfil</h2>
          <div className="cob-lateral-tarjeta cv-lista-filas">
            {mat && (
              <div className="cob-fila-perfil">
                <span>Matrícula {mat.numero}</span>
                <Chip tono={ESTADO_MATRICULA[mat.estado].tono}>{ESTADO_MATRICULA[mat.estado].texto}</Chip>
              </div>
            )}
            {mat && (
              <div className="cob-fila-perfil">
                <span>Vence</span>
                <span style={{ fontWeight: 600 }}>{enDias(mat.vence, estado.ahora)}</span>
              </div>
            )}
            {prof.coberturas.filter((c) => c.obraSocial !== 'Particular').map((c) => (
              <div key={c.obraSocial} className="cob-fila-perfil">
                <span>{c.obraSocial}</span>
                <Chip tono={ESTADO_COBERTURA[c.estado].tono}>{ESTADO_COBERTURA[c.estado].texto}</Chip>
              </div>
            ))}
          </div>
          <div className="cv-pila cv-gap-8">
            {pendientes > 0 && <a href="#/profesional">Tenés {pendientes} {pendientes === 1 ? 'dato' : 'datos'} de cobertura para revisar</a>}
            <a href={`#/perfil/${prof.id}`}>Ver cómo te ve un paciente</a>
          </div>
        </aside>
      </div>
    </Pagina>
  );
}
