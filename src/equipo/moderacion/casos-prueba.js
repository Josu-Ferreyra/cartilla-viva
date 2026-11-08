// Prueba de ~20 reseñas (más publicidad y temas ajenos) que pide la Entrega 4. Sin funciones del navegador: lo usa también el script de Node.
// Mezcla críticas duras pero válidas, insultos, nombres de empleados, teléfonos, ironía, abreviaturas y spam.
// Hay casos que las reglas fijas no detectan a propósito (DNI con puntos, insultos fuera de la lista,
// datos de salud de terceros): sirven para mostrar dónde aporta la IA.
export const CASOS = [
  { id: 'c01', texto: 'Me cobraron particular aunque figuraba con OSEP… y la secretaria, Laura, es una [insulto].', esperado: 'retener' },
  { id: 'c02', texto: 'Me cobraron particular aunque en la plataforma figuraba con OSEP. La atención fue buena, pero confirmen la cobertura antes de ir.', esperado: 'publicar' },
  { id: 'c03', texto: 'Excelente, me hicieron esperar 2 horas en la sala y ni me miró a la cara. Un lujo.', esperado: 'publicar' },
  { id: 'c04', texto: 'q mal atendieron, nunca +. la dra llego tarde y se fue rapido', esperado: 'publicar' },
  { id: 'c05', texto: 'Es una inútil, no sabe nada de nada. No pierdan el tiempo.', esperado: 'retener' },
  { id: 'c06', texto: 'La recepcionista Carla me trató re mal y me cortó el teléfono dos veces.', esperado: 'retener' },
  { id: 'c07', texto: 'Si quieren turno escríbanme al 261 555-1234 y les paso el contacto directo.', esperado: 'retener' },
  { id: 'c08', texto: 'Muy buena profesional, me escuchó y me explicó todo con mucha paciencia.', esperado: 'publicar' },
  { id: 'c09', texto: 'Compren suplementos naturales en www.ofertas-salud-ya.com con 50% off!!!', esperado: 'retener' },
  { id: 'c10', texto: 'El consultorio es lindo pero los turnos se atrasan siempre una hora. Organícense.', esperado: 'publicar' },
  { id: 'c11', texto: 'No me gustó para nada, sentí que no me prestaba atención. No vuelvo.', esperado: 'publicar' },
  { id: 'c12', texto: 'La secretaria, Romina, un amor. La doctora también, súper atenta.', esperado: 'retener' },
  { id: 'c13', texto: 'Qué pelotudo el que atiende en la puerta, te mira como si molestaras.', esperado: 'retener' },
  { id: 'c14', texto: 'Me dijo que atendía OSEP y después me cobró la consulta entera. Avisen antes, che.', esperado: 'publicar' },
  { id: 'c15', texto: 'Re recomendable!! súper puntual y atenta, volvería sin dudarlo', esperado: 'publicar' },
  { id: 'c16', texto: 'Me sacaron el turno con mi DNI 30.123.456 pero a nombre de otra persona, un desastre.', esperado: 'retener' },
  { id: 'c17', texto: 'Un genio el doctor, genio para cobrar de más. Es un chorro.', esperado: 'retener' },
  { id: 'c18', texto: 'Mi vecina Graciela tiene depresión y la atiende ella, por eso fui. Muy buena.', esperado: 'retener' },
  { id: 'c19', texto: 'La enfermera Lucía me puso mal la vacuna y me dolió una semana.', esperado: 'retener' },
  { id: 'c20', texto: 'Atención correcta, nada especial. Tardó casi un mes en mandarme el informe.', esperado: 'publicar' },
  { id: 'c21', texto: 'Aprovechá 2x1 en cremas importadas, escribime por privado y te paso el catálogo.', esperado: 'retener' },
  { id: 'c22', texto: 'Qué papelón lo de anoche, el árbitro vendido. Vamos Lepra carajo.', esperado: 'retener' },
  { id: 'c23', texto: 'Muy buena atención.', esperado: 'publicar' },
];
