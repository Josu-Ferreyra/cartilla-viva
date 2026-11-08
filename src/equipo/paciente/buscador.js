// A1 · Buscador. Funciones puras: no leen ni modifican el store.

// Primero lo verificado; lo que tiene aviso queda al final.
const PRIORIDAD = { verificada: 0, declarada: 1, sin_confirmar: 2, en_disputa: 3 };

// → Array<{ prof, cob }>, donde cob es la cobertura buscada de ese profesional
export function buscar(profesionales, { especialidad, cobertura, zona }) {
  return profesionales
    .filter((prof) => prof.especialidad === especialidad && prof.zona === zona)
    .map((prof) => ({
      prof,
      cob: prof.coberturas.find((c) => c.obraSocial === cobertura && c.estado !== 'baja'),
    }))
    .filter((r) => r.cob)
    .sort((a, b) => (PRIORIDAD[a.cob.estado] ?? 9) - (PRIORIDAD[b.cob.estado] ?? 9) || a.prof.km - b.prof.km);
}

// Los anuncios nunca entran al ranking: se muestran aparte, rotulados.
export function anunciosPara(anuncios, { especialidad, zona }) {
  return anuncios.filter((a) => a.aprobado && a.especialidad === especialidad && a.zona === zona);
}
