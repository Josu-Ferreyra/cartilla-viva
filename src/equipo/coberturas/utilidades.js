// Helpers locales del área 03 (ver NOTAS.md).

// Reportes «no atiende mi cobertura» de un profesional para una obra social.
export const reportesDe = (estado, profId, obraSocial, desdeHora = -Infinity) =>
  estado.reportes.filter((r) => r.profId === profId && r.obraSocial === obraSocial && r.hora >= desdeHora);

// Cantidad de pacientes distintos que reportaron (igual criterio que reglas.reportarNoAtiende).
export const pacientesDistintos = (reportes) => new Set(reportes.map((r) => r.pacienteId)).size;

export const pacientes = (n) => `${n} paciente${n === 1 ? '' : 's'}`;

// 'Dra. Marina Ruiz' -> 'Marina'
export const primerNombre = (nombre) => nombre.replace(/^(Dra?\.|Lic\.)\s+/, '').split(/\s+/)[0];

// 'OSEP' -> ['OSEP'] | '210, 310 ' -> ['210', '310']
export const separarPlanes = (texto) => texto.split(',').map((p) => p.trim()).filter(Boolean);

export const unirPlanes = (planes) => (planes ?? []).join(', ');
