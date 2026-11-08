// Reseñas de ejemplo: completan, hasta `cantResenas`, las reseñas explícitas de datos.js para que
// el puntaje y la cantidad calculados desde las reseñas coincidan con los de los datos de prueba.
// Es determinista (sin azar) y deja cada reseña sin respuesta del profesional.

const ABRE = {
  5: ['Excelente atención.', 'Muy buena experiencia.', 'Lo recomiendo sin dudas.', 'Me sentí escuchado desde el primer momento.', 'Atención cálida y profesional.', 'Superó lo que esperaba.', 'Quedé muy conforme.', 'Un lujo de profesional.'],
  4: ['Muy buena atención.', 'Quedé conforme con la consulta.', 'Buena experiencia en general.', 'Profesional y respetuoso con los tiempos.', 'Me explicó todo con claridad.', 'Recomendable.', 'Atención correcta y amable.', 'Salí con las dudas resueltas.'],
  3: ['La atención fue aceptable.', 'Cumple, sin más.', 'Esperaba un poco más.', 'Experiencia regular.', 'Está bien, aunque con detalles por mejorar.', 'Ni buena ni mala.'],
  2: ['No fue lo que esperaba.', 'Me quedé con ganas de más.', 'La consulta me resultó apurada.', 'Tuve algunos problemas con la atención.', 'Podría mejorar bastante.'],
  1: ['No volvería.', 'Mala experiencia.', 'No me sentí escuchado.', 'Tuve que esperar mucho y la consulta fue muy corta.'],
};
const CIERRA = {
  5: ['Los turnos son puntuales.', 'Explica cada paso con paciencia.', 'El consultorio es cómodo y está bien ubicado.', 'Me dio seguimiento entre consultas.', 'Se nota que le gusta lo que hace.', 'Responde las dudas sin apuro.'],
  4: ['A veces el turno se demora unos minutos.', 'El consultorio es cómodo.', 'Escucha con atención.', 'Los honorarios son razonables.', 'Pude coordinar el turno fácilmente.', 'Volvería a consultar.'],
  3: ['El turno se demoró más de lo previsto.', 'Me costó coordinar el horario.', 'La explicación fue algo escueta.', 'No sentí mucha diferencia.'],
  2: ['Esperé bastante pasada la hora del turno.', 'Sentí poca atención a mis dudas.', 'Fue difícil conseguir otro turno.', 'La consulta fue más corta de lo acordado.'],
  1: ['Mi consulta duró muy poco y no se resolvió nada.', 'Hubo problemas con el turno y nadie avisó.', 'Sentí que no le importaba mi caso.'],
};

// Patrón de descuentos sobre 5 estrellas: reparte unos pocos 4, 3, 2 y 1 entre muchos 5.
const PATRON = [1, 0, 1, 0, 0, 2, 0, 1, 0, 0, 3, 0, 1, 0, 2, 0];

function puntajes(cantidad, suma) {
  const d = Array(cantidad).fill(0);
  let resto = 5 * cantidad - suma;
  for (let pasada = 0; resto > 0; pasada += 1) {
    for (let i = 0; i < cantidad && resto > 0; i += 1) {
      const quita = Math.min(pasada === 0 ? PATRON[i % PATRON.length] : 1, 4 - d[i], resto);
      d[i] += quita;
      resto -= quita;
    }
  }
  return d.map((x) => 5 - x);
}

// La suma de estrellas más cercana a `rating * cantidad` cuyo promedio redondea a `rating`.
function sumaObjetivo(rating, cantidad) {
  const ideal = Math.round(rating * cantidad);
  for (let delta = 0; delta <= cantidad; delta += 1) {
    for (const s of [ideal + delta, ideal - delta]) {
      if (Math.round((s / cantidad) * 10) / 10 === rating) return s;
    }
  }
  return ideal;
}

export function crearResenasSemilla(profesionales, explicitas) {
  const salida = [];
  let paciente = 100;
  for (const prof of profesionales) {
    const propias = explicitas.filter((r) => r.profId === prof.id);
    const faltan = prof.cantResenas - propias.length;
    if (faltan <= 0) continue;
    const suma = sumaObjetivo(prof.rating, prof.cantResenas) - propias.reduce((t, r) => t + r.puntaje, 0);
    const usados = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    puntajes(faltan, suma).forEach((puntaje, i) => {
      const k = usados[puntaje]++;
      const a = ABRE[puntaje];
      const c = CIERRA[puntaje];
      paciente += 1;
      salida.push({
        id: `rs-${prof.id}-${i + 1}`, profId: prof.id, pacienteId: `pac${paciente}`, puntaje,
        hora: -(500 + ((i * 53 + 17) % 120) * 24 + (i % 24)), // más viejas que las explícitas
        estado: 'publicada',
        texto: `${a[k % a.length]} ${c[(k * 3 + Math.floor(k / a.length)) % c.length]}`,
        moderacion: null, mensajeOperador: null,
      });
    });
  }
  return salida;
}
