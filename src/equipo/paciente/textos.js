// Funciones auxiliares del área 01 (ver NOTAS.md).
import { haceTiempo } from '../../core/formato.js';

const conPlanes = (texto, cob) => (cob.planes?.length ? `${texto} · plan ${cob.planes.join(', ')}` : texto);

// Chip de la fila de resultados: «OSEP verificada · hace 12 días»
export function textoChipBusqueda(cob, ahora) {
  const os = cob.obraSocial;
  const textos = {
    verificada: `${os} verificada · ${haceTiempo(cob.verificadaEn, ahora)}`,
    declarada: `${os} declarada`,
    sin_confirmar: `${os} sin confirmar`,
    en_disputa: `${os} en disputa`,
  };
  return conPlanes(textos[cob.estado] ?? os, cob);
}

// Chip de la lista de coberturas del perfil: «Sin confirmar · desde hoy»
export function textoChipPerfil(cob, ahora) {
  const textos = {
    verificada: `Verificada · ${haceTiempo(cob.verificadaEn, ahora)}`,
    declarada: 'Declarada',
    sin_confirmar: `Sin confirmar · desde ${haceTiempo(cob.cambioEn, ahora)}`,
    en_disputa: 'En disputa',
    baja: 'Ya no atiende',
  };
  return conPlanes(textos[cob.estado] ?? '', cob);
}

// Concordancia con el título del profesional: «Psicóloga» → femenino.
export const esFemenino = (prof) => prof.titulo.endsWith('a');

export const resultados = (n) => (n === 1 ? '1 resultado' : `${n} resultados`);

// Mismo criterio que reglas.reportarNoAtiende: cuenta pacientes, no reportes.
export function pacientesQueReportaron(estado, profId, obraSocial) {
  return new Set(
    estado.reportes.filter((r) => r.profId === profId && r.obraSocial === obraSocial).map((r) => r.pacienteId),
  ).size;
}
