import { agregarMensaje, getProf, nuevoId } from './reglas.js';
import { PERFIL_VACIO } from './datos.js';

// Acciones de las secciones del menú (perfil, reseñas, matrículas, avisos y reglas).
// Igual que en reglas.js: reciben el estado y un payload, y devuelven un estado nuevo.

const copia = (e) => structuredClone(e);

// Deja una línea en la bitácora que muestra la sección «Registro» del operador.
function anotar(s, de, tipo, texto) {
  s.bitacora.push({ id: nuevoId(s, 'log'), de, a: 'Sistema', tipo, texto, hora: s.ahora });
}

export function actualizarPerfil(e, { profId, cambios }) {
  const s = copia(e);
  if (!getProf(s, profId)) return s;
  s.perfiles[profId] = { ...PERFIL_VACIO, ...s.perfiles[profId], ...cambios };
  anotar(s, 'Profesional', 'informar', `${getProf(s, profId).nombreCorto} actualizó los datos de su perfil`);
  return s;
}

// texto vacío = quitar la respuesta
export function responderResenaRecibida(e, { resenaId, texto }) {
  const s = copia(e);
  const resena = s.resenas.find((r) => r.id === resenaId);
  if (!resena) return s;
  const limpio = texto?.trim();
  if (limpio) resena.respuesta = { texto: limpio, hora: s.ahora };
  else delete resena.respuesta;
  return s;
}

// El paciente retira su reseña. Si estaba retenida, el caso abierto se cierra.
export function eliminarResena(e, { resenaId }) {
  const s = copia(e);
  const resena = s.resenas.find((r) => r.id === resenaId);
  if (!resena) return s;
  const caso = s.casos.find((c) => c.resenaId === resenaId && c.estado === 'abierto');
  if (caso) {
    agregarMensaje(caso, { n: 'D5', de: 'Paciente', a: 'A2', tipo: 'rechazar', texto: 'Retiré la reseña' }, s.ahora);
    caso.decision = 'retirada';
    caso.estado = 'resuelto';
    caso.etapa = null;
  }
  s.resenas = s.resenas.filter((r) => r.id !== resenaId);
  return s;
}

// La matrícula vigente o por vencer mantiene el sello de «matrícula verificada» del perfil.
export function actualizarMatricula(e, { profId, estado }) {
  const s = copia(e);
  const prof = getProf(s, profId);
  const mat = s.matriculas[profId];
  if (!prof || !mat) return s;
  mat.estado = estado;
  if (estado === 'vigente') { mat.revisadaEn = s.ahora; mat.vence = s.ahora + 24 * 365; }
  prof.matriculaVerificada = estado === 'vigente' || estado === 'por_vencer';
  const accion = { vigente: 'revalidó', observada: 'observó', suspendida: 'suspendió', por_vencer: 'marcó por vencer' }[estado];
  anotar(s, 'Operador', estado === 'vigente' ? 'aceptar' : 'rechazar', `Se ${accion} la matrícula ${mat.numero} de ${prof.nombreCorto}`);
  return s;
}

export function resolverAnuncio(e, { id, estado, motivo }) {
  const s = copia(e);
  const anuncio = s.anuncios.find((a) => a.id === id);
  if (!anuncio) return s;
  anuncio.estado = estado;
  anuncio.aprobado = estado === 'aprobado';
  anuncio.motivo = estado === 'rechazado' ? (motivo?.trim() || null) : null;
  anuncio.hora = s.ahora;
  const texto = { aprobado: 'Se aprobó', rechazado: 'Se rechazó', pendiente: 'Vuelve a revisión:' }[estado];
  anotar(s, 'Operador', estado === 'aprobado' ? 'aceptar' : 'rechazar', `${texto} el aviso «${anuncio.titulo}»`);
  return s;
}

export function crearAnuncio(e, { titulo, texto, especialidad, zona }) {
  const s = copia(e);
  const anuncio = {
    id: nuevoId(s, 'a'), titulo: titulo.trim(), texto: texto.trim(), especialidad, zona,
    estado: 'pendiente', aprobado: false, hora: s.ahora, motivo: null,
  };
  s.anuncios.push(anuncio);
  anotar(s, 'Operador', 'informar', `Se cargó el aviso «${anuncio.titulo}» para revisión`);
  return s;
}

export function actualizarReglas(e, valores) {
  const s = copia(e);
  s.reglas = { ...s.reglas, ...valores };
  anotar(s, 'Operador', 'proponer',
    `Reglas de disputa: ${s.reglas.umbralReportes} reportes en ${s.reglas.ventanaDias} días`);
  return s;
}
