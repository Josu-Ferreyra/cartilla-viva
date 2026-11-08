import { crearEstadoInicial } from './datos.js';

// Cada regla recibe el estado y un payload y devuelve un estado nuevo.
// Trabajan sobre una copia (structuredClone), así que el estado original nunca se muta.

const copia = (e) => structuredClone(e);

function nuevoId(s, prefijo) {
  const id = `${prefijo}${s.siguienteId}`;
  s.siguienteId += 1;
  return id;
}
export const getProf = (e, id) => e.profesionales.find((p) => p.id === id);
export const getCob = (prof, obraSocial) => prof?.coberturas.find((c) => c.obraSocial === obraSocial);

function agregarMensaje(caso, { n, de, a, tipo, texto }, hora) {
  caso.registro.push({ n: n ?? String(caso.registro.length + 1), de, a, tipo, texto, hora });
}

const casoAbierto = (s, profId, obraSocial) =>
  s.casos.find((c) => c.estado === 'abierto' && c.profId === profId && c.obraSocial === obraSocial);

const enCartilla = (s, profId, obraSocial) => (s.cartillas[obraSocial] ?? []).includes(profId);

// A3 no encuentra al profesional en la cartilla: sin confirmar + caso + alerta.
function abrirSinConfirmar(s, prof, cob, conReporte) {
  const ahora = s.ahora;
  const os = cob.obraSocial;
  cob.estado = 'sin_confirmar';
  cob.cambioEn = ahora;

  const alertaId = nuevoId(s, 'alerta');
  const caso = {
    id: nuevoId(s, 'caso'), tipo: 'cobertura_sin_confirmar', estado: 'abierto', etapa: 'esperando_profesional',
    profId: prof.id, obraSocial: os, resenaId: null, alertaId,
    creado: ahora, enColaDesde: null, decision: null, registro: [],
  };
  if (conReporte) {
    agregarMensaje(caso, { n: '5', de: 'Paciente', a: 'A1', tipo: 'informar', texto: 'No atiende mi cobertura' }, ahora);
    agregarMensaje(caso, { n: '6', de: 'A1', a: 'A3', tipo: 'informar', texto: `Reporte sobre ${prof.nombreCorto} / ${os} (vía base)` }, ahora);
  }
  agregarMensaje(caso, { n: '7', de: 'A3', a: 'A1', tipo: 'informar', texto: `La cartilla de ${os} ya no lo incluye: sin confirmar (vía base)` }, ahora);
  agregarMensaje(caso, { n: '8', de: 'A3', a: 'Profesional', tipo: 'proponer', texto: `¿Sacamos ${os} de tu perfil?` }, ahora);
  s.casos.push(caso);
  s.alertas.push({
    id: alertaId, profId: prof.id, obraSocial: os, casoId: caso.id,
    estado: 'pendiente', creada: ahora, respuesta: null, planes: null,
  });
}

// A1 y A3 no coinciden: la cartilla incluye al profesional pero hay varios reportes en contra.
function abrirDisputa(s, prof, cob, cantReportes) {
  const ahora = s.ahora;
  const os = cob.obraSocial;
  cob.estado = 'en_disputa';
  cob.cambioEn = ahora;

  const caso = {
    id: nuevoId(s, 'caso'), tipo: 'disputa', estado: 'abierto', etapa: 'cola_operador',
    profId: prof.id, obraSocial: os, resenaId: null, alertaId: null,
    creado: ahora, enColaDesde: ahora, decision: null, registro: [],
  };
  agregarMensaje(caso, { de: 'A3', a: 'A1', tipo: 'informar', texto: `${os} verificada en la cartilla (vía base).` }, ahora);
  agregarMensaje(caso, { de: 'A1', a: 'A3', tipo: 'informar', texto: `${cantReportes} reportes «no atiende mi cobertura» en 7 días (vía base).` }, ahora);
  agregarMensaje(caso, { de: 'A3', a: 'A1', tipo: 'informar', texto: `${os} pasa a «en disputa», con aviso.` }, ahora);
  agregarMensaje(caso, { de: 'A3', a: 'Operador', tipo: 'proponer', texto: `Sacar ${os} del perfil (vía cola).` }, ahora);
  s.casos.push(caso);
}

export function reportarNoAtiende(e, { profId, obraSocial }) {
  const s = copia(e);
  const prof = getProf(s, profId);
  const cob = getCob(prof, obraSocial);
  if (!prof || !cob) return s;

  s.reportes.push({ id: nuevoId(s, 'rep'), profId, obraSocial, pacienteId: s.pacienteActual, hora: s.ahora });

  if (casoAbierto(s, profId, obraSocial)) return s;

  if (!enCartilla(s, profId, obraSocial)) {
    if (cob.estado === 'verificada' || cob.estado === 'declarada') abrirSinConfirmar(s, prof, cob, true);
    return s;
  }

  const pacientes = new Set(
    s.reportes
      .filter((r) => r.profId === profId && r.obraSocial === obraSocial && r.hora >= s.ahora - 168)
      .map((r) => r.pacienteId),
  );
  if (pacientes.size >= 3 && cob.estado === 'verificada') abrirDisputa(s, prof, cob, pacientes.size);
  return s;
}

export function ejecutarVerificacion(e) {
  const s = copia(e);
  for (const prof of s.profesionales) {
    for (const cob of prof.coberturas) {
      if (cob.obraSocial === 'Particular') continue;
      if (['baja', 'sin_confirmar', 'en_disputa'].includes(cob.estado)) continue;
      if (enCartilla(s, prof.id, cob.obraSocial)) {
        cob.estado = 'verificada';
        cob.verificadaEn = s.ahora;
        cob.cambioEn = s.ahora;
      } else if (!casoAbierto(s, prof.id, cob.obraSocial)) {
        abrirSinConfirmar(s, prof, cob, false);
      }
    }
  }
  return s;
}

export function responderAlerta(e, { alertaId, respuesta, planes }) {
  const s = copia(e);
  const alerta = s.alertas.find((a) => a.id === alertaId);
  if (!alerta || alerta.estado !== 'pendiente') return s;
  const caso = s.casos.find((c) => c.id === alerta.casoId);
  const cob = getCob(getProf(s, alerta.profId), alerta.obraSocial);
  const os = alerta.obraSocial;
  const ahora = s.ahora;

  alerta.estado = 'respondida';
  alerta.respuesta = respuesta;

  if (respuesta === 'baja') {
    if (cob) { cob.estado = 'baja'; cob.cambioEn = ahora; }
    if (caso) {
      caso.estado = 'resuelto'; caso.etapa = null; caso.decision = 'baja_profesional';
      agregarMensaje(caso, { n: 'D3', de: 'Profesional', a: 'A3', tipo: 'aceptar', texto: `Sí, dejé ${os}` }, ahora);
      agregarMensaje(caso, { n: '10', de: 'A3', a: 'A1', tipo: 'informar', texto: `${os} se saca del perfil, lo confirmó el profesional (vía base)` }, ahora);
    }
  } else if (respuesta === 'sigue') {
    if (cob) { cob.estado = 'en_disputa'; cob.cambioEn = ahora; }
    if (caso) {
      if (caso.etapa !== 'cola_operador') { caso.etapa = 'cola_operador'; caso.enColaDesde = ahora; }
      agregarMensaje(caso, { n: 'D3', de: 'Profesional', a: 'A3', tipo: 'rechazar', texto: `Sigo atendiendo ${os}` }, ahora);
    }
  } else if (respuesta === 'planes') {
    alerta.planes = planes;
    if (cob) { cob.planes = planes; cob.estado = 'declarada'; cob.cambioEn = ahora; }
    if (caso) {
      caso.estado = 'resuelto'; caso.etapa = null; caso.decision = 'planes';
      agregarMensaje(caso, { n: 'D3', de: 'Profesional', a: 'A3', tipo: 'informar', texto: `Atiendo solo el plan ${(planes ?? []).join(', ')}` }, ahora);
    }
  }
  return s;
}

export function avanzarHoras(e, { horas }) {
  const s = copia(e);
  s.ahora += horas;
  for (const caso of s.casos) {
    if (caso.tipo !== 'cobertura_sin_confirmar' || caso.estado !== 'abierto' || caso.etapa !== 'esperando_profesional') continue;
    const transcurridas = s.ahora - caso.creado;
    const yaRecordado = caso.registro.some((m) => m.texto === 'Recordatorio (día 3)');
    if (transcurridas >= 72 && !yaRecordado) {
      agregarMensaje(caso, { de: 'A3', a: 'Profesional', tipo: 'pedir', texto: 'Recordatorio (día 3)' }, caso.creado + 72);
    }
    if (transcurridas >= 168) {
      caso.etapa = 'cola_operador';
      caso.enColaDesde = caso.creado + 168;
      agregarMensaje(caso, { de: 'A3', a: 'A1', tipo: 'informar', texto: `Día 7: ${caso.obraSocial} sigue sin confirmar (vía base)` }, caso.enColaDesde);
      agregarMensaje(caso, { de: 'A3', a: 'Operador', tipo: 'proponer', texto: 'Llamar al consultorio (vía cola)' }, caso.enColaDesde);
    }
  }
  return s;
}

// Cierra la alerta pendiente de un caso cuando el operador decide por la profesional.
function cerrarAlertaDelCaso(s, caso, respuesta) {
  const alerta = s.alertas.find((a) => a.id === caso.alertaId);
  if (alerta && alerta.estado === 'pendiente') { alerta.estado = 'respondida'; alerta.respuesta = respuesta; }
}

export function confirmarDecisionOperador(e, { casoId, decision, nota }) {
  const s = copia(e);
  const caso = s.casos.find((c) => c.id === casoId);
  if (!caso || caso.estado !== 'abierto') return s;
  const cob = getCob(getProf(s, caso.profId), caso.obraSocial);
  const os = caso.obraSocial;
  const ahora = s.ahora;

  if (nota) agregarMensaje(caso, { de: 'Operador', a: 'Profesional', tipo: 'pedir', texto: `(llamada) ${nota}` }, ahora);

  if (decision === 'baja') {
    if (cob) { cob.estado = 'baja'; cob.cambioEn = ahora; }
    caso.decision = 'baja_operador';
    agregarMensaje(caso, { n: 'D6', de: 'Operador', a: 'A3', tipo: 'aceptar', texto: `Se saca ${os} del perfil` }, ahora);
    cerrarAlertaDelCaso(s, caso, 'baja');
  } else {
    if (cob) { cob.estado = 'verificada'; cob.verificadaEn = ahora; cob.cambioEn = ahora; }
    caso.decision = 'mantener';
    agregarMensaje(caso, { n: 'D6', de: 'Operador', a: 'A3', tipo: 'rechazar', texto: `Se mantiene ${os}: confirmada por llamada` }, ahora);
    cerrarAlertaDelCaso(s, caso, 'sigue');
  }
  caso.estado = 'resuelto';
  caso.etapa = null;
  return s;
}

export function resolverDisputa(e, { casoId, decision, planes, nota }) {
  const s = copia(e);
  const caso = s.casos.find((c) => c.id === casoId);
  if (!caso || caso.estado !== 'abierto') return s;
  const cob = getCob(getProf(s, caso.profId), caso.obraSocial);
  const os = caso.obraSocial;
  const ahora = s.ahora;

  if (nota) {
    agregarMensaje(caso, { n: '5', de: 'Operador', a: 'Profesional', tipo: 'pedir', texto: `(llamada) ¿Atendés ${os}?` }, ahora);
    agregarMensaje(caso, { n: '6', de: 'Profesional', a: 'Operador', tipo: 'informar', texto: nota }, ahora);
  }

  if (decision === 'sacar') {
    if (cob) { cob.estado = 'baja'; cob.cambioEn = ahora; }
    agregarMensaje(caso, { n: 'D7', de: 'Operador', a: 'A3', tipo: 'aceptar', texto: `Se saca ${os} del perfil` }, ahora);
  } else if (decision === 'corregir') {
    if (cob) { cob.estado = 'verificada'; cob.verificadaEn = ahora; cob.cambioEn = ahora; cob.planes = planes; }
    agregarMensaje(caso, { n: 'D7', de: 'Operador', a: 'A3', tipo: 'rechazar', texto: `No se saca: se corrige a plan ${(planes ?? []).join(', ')}` }, ahora);
  } else {
    if (cob) { cob.estado = 'verificada'; cob.verificadaEn = ahora; cob.cambioEn = ahora; }
    agregarMensaje(caso, { n: 'D7', de: 'Operador', a: 'A3', tipo: 'rechazar', texto: `No se saca: ${os} sigue verificada` }, ahora);
  }
  caso.decision = decision;
  caso.estado = 'resuelto';
  caso.etapa = null;
  return s;
}

export function enviarResena(e, { profId, puntaje, texto, moderacion }) {
  const s = copia(e);
  const ahora = s.ahora;
  const publica = moderacion?.decision === 'publicar';
  const resena = {
    id: nuevoId(s, 'res'), profId, pacienteId: s.pacienteActual, puntaje, hora: ahora,
    estado: publica ? 'publicada' : 'retenida', texto, moderacion: moderacion ?? null, mensajeOperador: null,
  };

  const previa = s.resenas.find((r) => r.profId === profId && r.pacienteId === s.pacienteActual && r.estado === 'rechazada' && !r.reemplazadaPor);
  if (previa) previa.reemplazadaPor = resena.id;
  s.resenas.push(resena);

  if (!publica) {
    const caso = {
      id: nuevoId(s, 'caso'), tipo: 'resena_retenida', estado: 'abierto', etapa: 'cola_operador',
      profId, obraSocial: null, resenaId: resena.id, alertaId: null,
      creado: ahora, enColaDesde: ahora, decision: null, registro: [],
    };
    const motivos = (moderacion?.motivos ?? []).join(', ');
    agregarMensaje(caso, { n: '11', de: 'Paciente', a: 'A2', tipo: 'pedir', texto: 'Publicar reseña' }, ahora);
    agregarMensaje(caso, { n: '12', de: 'A2', a: 'Operador', tipo: 'proponer', texto: `Retener: ${motivos} (vía cola)` }, ahora);
    s.casos.push(caso);
  }
  return s;
}

export function resolverResena(e, { casoId, decision, mensaje }) {
  const s = copia(e);
  const caso = s.casos.find((c) => c.id === casoId);
  if (!caso || caso.estado !== 'abierto') return s;
  const resena = s.resenas.find((r) => r.id === caso.resenaId);

  if (decision === 'rechazar') {
    if (resena) { resena.estado = 'rechazada'; resena.mensajeOperador = mensaje; }
    agregarMensaje(caso, { n: 'D4', de: 'Operador', a: 'Paciente', tipo: 'rechazar', texto: mensaje }, s.ahora);
  } else {
    if (resena) resena.estado = 'publicada';
    agregarMensaje(caso, { n: 'D4', de: 'Operador', a: 'A2', tipo: 'aceptar', texto: 'Se publica' }, s.ahora);
  }
  caso.decision = decision;
  caso.estado = 'resuelto';
  caso.etapa = null;
  return s;
}

export function reiniciar() {
  return crearEstadoInicial();
}
