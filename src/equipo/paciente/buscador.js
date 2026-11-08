// A1 · Buscador. Funciones puras: no leen ni modifican el store.
import { TODOS } from '../../core/datos.js';

// Primero lo verificado; lo que tiene aviso queda al final.
const PRIORIDAD = { verificada: 0, declarada: 1, sin_confirmar: 2, en_disputa: 3 };

export const ORDENES = {
  relevancia: 'Cobertura verificada y cercanía',
  puntaje: 'Mejor puntuados',
  resenas: 'Más reseñas',
};

// Sin mayúsculas ni tildes: «lopez» encuentra «López».
const normalizar = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

// Sin planes cargados no hay restricción conocida: la obra social se atiende completa.
const atiendePlan = (cob, plan) => {
  const buscado = normalizar(plan);
  return !buscado || !cob.planes?.length || cob.planes.some((p) => normalizar(p) === buscado);
};

// Con «TODOS» elige la mejor cobertura de las que se buscan (nunca 'Particular').
function coberturaBuscada(prof, cobertura, plan) {
  const candidatas = prof.coberturas
    .filter((c) => c.estado !== 'baja' && (cobertura === TODOS ? c.obraSocial !== 'Particular' : c.obraSocial === cobertura))
    .filter((c) => atiendePlan(c, plan))
    .sort((a, b) => (PRIORIDAD[a.estado] ?? 9) - (PRIORIDAD[b.estado] ?? 9));
  return candidatas[0];
}

// Mayor primero; sin reseñas al final.
const porMayor = (a, b) => (b ?? -1) - (a ?? -1);

// resumenDe(profId) → { rating, cantidad }
// → Array<{ prof, cob }>, donde cob es la cobertura buscada de ese profesional
export function buscar(profesionales, { nombre, especialidad, cobertura, plan, zona }, orden, resumenDe) {
  const texto = normalizar(nombre ?? '');
  const porCercania = (a, b) => (PRIORIDAD[a.cob.estado] ?? 9) - (PRIORIDAD[b.cob.estado] ?? 9) || a.prof.km - b.prof.km;
  const criterios = {
    relevancia: porCercania,
    puntaje: (a, b) => porMayor(resumenDe(a.prof.id).rating, resumenDe(b.prof.id).rating) || porMayor(resumenDe(a.prof.id).cantidad, resumenDe(b.prof.id).cantidad) || porCercania(a, b),
    resenas: (a, b) => porMayor(resumenDe(a.prof.id).cantidad, resumenDe(b.prof.id).cantidad) || porMayor(resumenDe(a.prof.id).rating, resumenDe(b.prof.id).rating) || porCercania(a, b),
  };
  return profesionales
    .filter((prof) => (especialidad === TODOS || prof.especialidad === especialidad)
      && (zona === TODOS || prof.zona === zona)
      && normalizar(prof.nombre).includes(texto))
    .map((prof) => ({ prof, cob: coberturaBuscada(prof, cobertura, plan) }))
    .filter((r) => r.cob)
    .sort(criterios[orden] ?? criterios.relevancia);
}

// Los anuncios nunca entran al ranking: se muestran aparte, rotulados.
export function anunciosPara(anuncios, { especialidad, zona }) {
  return anuncios.filter((a) => a.aprobado
    && (especialidad === TODOS || a.especialidad === especialidad)
    && (zona === TODOS || a.zona === zona));
}
