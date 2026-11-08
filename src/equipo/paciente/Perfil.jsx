import { useState } from 'react';
import Header from '../../componentes/Header.jsx';
import Chip from '../../componentes/Chip.jsx';
import Avatar from '../../componentes/Avatar.jsx';
import { useApp, selProf, selResenasPublicadas, selResumenResenas, selUltimaResenaDelPaciente, selReportesDelPaciente } from '../../core/store.jsx';
import { ESTADO_COBERTURA, haceTiempo, puntaje, iniciales } from '../../core/formato.js';
import { textoChipPerfil, esFemenino, pacientesQueReportaron } from './textos.js';
import './paciente.css';

const VOLVER = { href: '#/', texto: '← Volver a resultados' };
const RESENA_RECIENTE_HORAS = 24;

// Los botones de contacto no tienen pantalla en la demo: sin esto, href="#" llevaría a la búsqueda.
const sinNavegar = (ev) => ev.preventDefault();

function AvisoCobertura({ prof, cob, estado }) {
  const os = cob.obraSocial;
  if (cob.estado === 'en_disputa') {
    return (
      <div className="cv-aviso cv-aviso--durazno" role="status">
        <p className="cv-aviso__titulo">{os}: cobertura en disputa</p>
        <p className="cv-aviso__texto">Confirmala con el consultorio antes de ir.</p>
      </div>
    );
  }
  const fem = esFemenino(prof);
  const n = pacientesQueReportaron(estado, prof.id, os);
  const reporte = n === 0 ? '' : n === 1 ? `Un paciente reportó que ya no atiende ${os} y ` : `${n} pacientes reportaron que ya no atiende ${os} y `;
  const cartilla = `la cartilla de ${os} ya no ${fem ? 'la' : 'lo'} incluye.`;
  return (
    <div className="cv-aviso cv-aviso--manteca" role="status">
      <p className="cv-aviso__titulo">{os}: cobertura sin confirmar</p>
      <p className="cv-aviso__texto">
        {reporte ? reporte + cartilla : cartilla[0].toUpperCase() + cartilla.slice(1)}{' '}
        Le estamos preguntando {fem ? 'a la profesional' : 'al profesional'}. Confirmalo con el consultorio antes de ir.
      </p>
    </div>
  );
}

function Reporte({ prof, estado, acciones }) {
  const [abierto, setAbierto] = useState(false);
  const propios = selReportesDelPaciente(estado, prof.id);

  if (propios.length > 0) {
    // Un renglón por obra social, con el reporte más reciente de cada una.
    const porOs = new Map();
    for (const r of propios) if (!porOs.has(r.obraSocial) || r.hora > porOs.get(r.obraSocial).hora) porOs.set(r.obraSocial, r);
    return (
      <div className="cv-pila cv-gap-8" role="status">
        {[...porOs.values()].map((r) => (
          <p key={r.obraSocial} className="cv-meta pac-reporte-hecho">
            Reportaste «no atiende mi cobertura» para {r.obraSocial} {haceTiempo(r.hora, estado.ahora)}. Gracias.
          </p>
        ))}
      </div>
    );
  }

  const opciones = prof.coberturas.filter((c) => c.obraSocial !== 'Particular' && c.estado !== 'baja');
  if (opciones.length === 0) return null;

  return (
    <div className="cv-pila cv-gap-8">
      <button
        type="button"
        className="cv-boton cv-boton--enlace pac-reporte-enlace"
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
      >
        ¿No te atendieron con tu cobertura? Reportalo
      </button>
      {abierto && (
        <div className="cv-fila cv-gap-8">
          {opciones.map((c) => (
            <button
              key={c.obraSocial}
              type="button"
              className="cv-boton cv-boton--chico cv-boton--secundario"
              onClick={() => acciones.reportarNoAtiende({ profId: prof.id, obraSocial: c.obraSocial })}
            >
              No atiende {c.obraSocial}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EstadoResenaPropia({ prof, estado }) {
  const resena = selUltimaResenaDelPaciente(estado, prof.id);
  if (!resena) return null;

  if (resena.estado === 'retenida') {
    return (
      <div className="cv-aviso cv-aviso--lavanda pac-aviso-resena" role="status">
        <p className="cv-aviso__titulo">Tu reseña está en revisión</p>
        <p className="cv-aviso__texto">Una persona del equipo la revisa en 48 h como máximo.</p>
      </div>
    );
  }
  if (resena.estado === 'rechazada') {
    return (
      <div className="cv-aviso cv-aviso--rosa pac-aviso-resena" role="status">
        <p className="cv-aviso__titulo">Tu reseña no se publicó</p>
        {resena.mensajeOperador && <p className="cv-aviso__texto">{resena.mensajeOperador}</p>}
        <p className="cv-aviso__texto">
          <a className="pac-enlace-fuerte" href={`#/resena/${prof.id}`}>Corregir reseña →</a>
        </p>
      </div>
    );
  }
  if (resena.estado === 'publicada' && estado.ahora - resena.hora < RESENA_RECIENTE_HORAS) {
    return (
      <div className="cv-aviso cv-aviso--menta pac-aviso-resena" role="status">
        <p className="cv-aviso__titulo">Tu reseña se publicó. Gracias.</p>
      </div>
    );
  }
  return null;
}

export default function Perfil({ profId }) {
  const { estado, acciones } = useApp();
  const prof = selProf(estado, profId);

  if (!prof) {
    return (
      <div className="cv-pagina">
        <Header variante="paciente" volver={VOLVER} />
        <main className="cv-contenedor cv-main">
          <div className="cv-panel cv-pila cv-gap-16">
            <h1 className="cv-titulo-2">No encontramos este perfil</h1>
            <a href="#/">Volver a la búsqueda</a>
          </div>
        </main>
      </div>
    );
  }

  const conAviso = prof.coberturas.filter((c) => c.estado === 'sin_confirmar' || c.estado === 'en_disputa');
  const todasPublicadas = selResenasPublicadas(estado, prof.id);
  const publicadas = todasPublicadas.slice(0, 2);
  const resumen = selResumenResenas(estado, prof.id);

  return (
    <div className="cv-pagina">
      <Header variante="paciente" volver={VOLVER} />
      <main className="cv-contenedor cv-main">
        <div className="cv-columnas pac-perfil-columnas">
          <div className="cv-col-principal cv-pila cv-gap-40">
            <div className="cv-fila cv-gap-24">
              <Avatar iniciales={iniciales(prof.nombre)} tono={prof.avatar} tam={80} />
              <div>
                <h1 className="cv-titulo-1 cv-titulo-1--m">{prof.nombre}</h1>
                <p className="pac-perfil-sub">
                  {prof.titulo} · {prof.zona}, {prof.barrio}
                  {prof.matriculaVerificada && ' · Matrícula verificada'}
                </p>
              </div>
            </div>

            {conAviso.map((cob) => <AvisoCobertura key={cob.obraSocial} prof={prof} cob={cob} estado={estado} />)}

            <section className="cv-pila cv-gap-12" aria-labelledby="pac-coberturas">
              <h2 id="pac-coberturas" className="cv-eyebrow">Coberturas</h2>
              <ul className="cv-lista-filas pac-coberturas">
                {prof.coberturas.map((cob) => (
                  <li key={cob.obraSocial} className="pac-cob-fila">
                    <span className="pac-cob-fila__nombre">{cob.obraSocial}</span>
                    <Chip tono={ESTADO_COBERTURA[cob.estado].tono}>{textoChipPerfil(cob, estado.ahora)}</Chip>
                  </li>
                ))}
              </ul>
            </section>

            <div className="cv-pila cv-gap-12">
              <div className="cv-fila cv-gap-12">
                <a className="cv-boton cv-boton--primario" href="#" onClick={sinNavegar}>Escribir por WhatsApp</a>
                <a className="cv-boton cv-boton--secundario" href="#" onClick={sinNavegar}>Llamar</a>
              </div>
              <Reporte prof={prof} estado={estado} acciones={acciones} />
            </div>
          </div>

          <aside className="cv-col-lateral cv-pila cv-gap-16" aria-label="Reseñas">
            <div className="cv-tarjeta pac-resenas cv-pila cv-gap-24">
              <div className="cv-fila cv-gap-12">
                <span className="pac-puntaje-grande">{puntaje(resumen.rating)}</span>
                <span className="cv-meta">{resumen.cantidad} {resumen.cantidad === 1 ? 'reseña moderada' : 'reseñas moderadas'}</span>
              </div>
              {publicadas.map((r) => (
                <div key={r.id} className="pac-resena">
                  <p className="pac-resena__texto">{r.texto}</p>
                  <p className="cv-meta pac-resena__meta">Paciente · {haceTiempo(r.hora, estado.ahora)}</p>
                </div>
              ))}
              {todasPublicadas.length > 0 && (
                <a className="pac-enlace-fuerte" href={`#/resenas/${prof.id}`}>Ver todas las reseñas y filtrar por estrellas →</a>
              )}
              <a className="pac-enlace-fuerte" href={`#/resena/${prof.id}`}>Escribir una reseña →</a>
            </div>
            <EstadoResenaPropia prof={prof} estado={estado} />
          </aside>
        </div>
      </main>
    </div>
  );
}
