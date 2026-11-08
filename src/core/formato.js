export const ESTADO_COBERTURA = {
  verificada:    { texto: 'Verificada',    tono: 'menta' },
  declarada:     { texto: 'Declarada',     tono: 'lavanda' },
  sin_confirmar: { texto: 'Sin confirmar', tono: 'manteca' },
  en_disputa:    { texto: 'En disputa',    tono: 'durazno' },
  baja:          { texto: 'Ya no atiende', tono: 'gris' },
};

export const TIPO_CASO = {
  resena_retenida:         { texto: 'Reseña retenida', tono: 'rosa' },
  cobertura_sin_confirmar: { texto: 'Sin confirmar',   tono: 'manteca' },
  disputa:                 { texto: 'En disputa',      tono: 'durazno' },
};

export const ESTADO_MATRICULA = {
  vigente:    { texto: 'Vigente',    tono: 'menta' },
  por_vencer: { texto: 'Por vencer', tono: 'manteca' },
  observada:  { texto: 'Observada',  tono: 'durazno' },
  suspendida: { texto: 'Suspendida', tono: 'rosa' },
};

export const ESTADO_ANUNCIO = {
  pendiente: { texto: 'Pendiente', tono: 'manteca' },
  aprobado:  { texto: 'Aprobado',  tono: 'menta' },
  rechazado: { texto: 'Rechazado', tono: 'rosa' },
};

export const ESTADO_RESENA = {
  publicada: { texto: 'Publicada',        tono: 'menta' },
  retenida:  { texto: 'En revisión',      tono: 'manteca' },
  rechazada: { texto: 'Pedimos cambios',  tono: 'rosa' },
};

const PLAZO_HORAS = 48;

// 'hoy' (< 24 h) | 'ayer' | 'hace N días'
export function haceTiempo(hora, ahora) {
  if (hora == null) return '';
  const dif = ahora - hora;
  if (dif < 24) return 'hoy';
  if (dif < 48) return 'ayer';
  return `hace ${Math.floor(dif / 24)} días`;
}

// Plazo de 48 h desde que el caso entró a la cola: '31 h' | 'vencido'
export function venceEn(caso, ahora) {
  const base = caso.enColaDesde ?? caso.creado;
  const restante = base + PLAZO_HORAS - ahora;
  return restante <= 0 ? 'vencido' : `${Math.ceil(restante)} h`;
}

// 'día N de 7' (N = horas desde la creación / 24, con tope 7)
export function diaDeSiete(caso, ahora) {
  const n = Math.min(7, Math.max(0, Math.floor((ahora - caso.creado) / 24)));
  return `día ${n} de 7`;
}

// 'Día D · HH h'
export function horaDemo(ahora) {
  const dia = Math.floor(ahora / 24) + 1;
  const hh = String(Math.floor(ahora % 24)).padStart(2, '0');
  return `Día ${dia} · ${hh} h`;
}

// 4.6 -> '4,6'
export function numero(n) {
  return String(n).replace('.', ',');
}

// 'la Dra. Marina Ruiz' | 'el Lic. Tomás Herrera' ('la' si el título termina en 'a')
export function conArticulo(prof, corto = false) {
  const articulo = prof.titulo.endsWith('a') ? 'la' : 'el';
  return `${articulo} ${corto ? prof.nombreCorto : prof.nombre}`;
}

// 'Dra. Marina Ruiz' -> 'MR'
export function iniciales(nombre) {
  return nombre
    .replace(/^(Dra?\.|Lic\.)\s+/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Antigüedad corta para listas: 'ahora' | 'hace 5 h' | 'hace 3 d'
export function haceCorto(hora, ahora) {
  const dif = ahora - hora;
  if (dif < 1) return 'ahora';
  if (dif < 24) return `hace ${Math.floor(dif)} h`;
  return `hace ${Math.floor(dif / 24)} d`;
}

// 'hoy' | 'ayer' | 'hace N días' hacia atrás; 'en N días' hacia adelante
export function enDias(hora, ahora) {
  const dias = Math.round((hora - ahora) / 24);
  if (dias === 0) return 'hoy';
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`;
}
