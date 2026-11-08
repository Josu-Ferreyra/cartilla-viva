export const ESPECIALIDADES = ['Psicología', 'Clínica médica', 'Pediatría', 'Nutrición'];
export const COBERTURAS = ['OSEP', 'OSDE'];               // 'Particular' no es obra social: no se verifica ni se busca
export const ZONAS = ['Godoy Cruz', 'Ciudad de Mendoza', 'Luján de Cuyo', 'Guaymallén'];
export const BUSQUEDA_INICIAL = { especialidad: 'Psicología', cobertura: 'OSEP', zona: 'Godoy Cruz' };

// estado de cobertura: 'verificada' | 'declarada' | 'sin_confirmar' | 'en_disputa' | 'baja'
const cob = (obraSocial, estado, verificadaEn, cambioEn = verificadaEn) =>
  ({ obraSocial, estado, verificadaEn, cambioEn, planes: null });

const P = (id, nombre, nombreCorto, especialidad, titulo, zona, barrio, km, rating, cantResenas, avatar, coberturas) =>
  ({ id, nombre, nombreCorto, especialidad, titulo, zona, barrio, km, rating, cantResenas, avatar, matriculaVerificada: true, coberturas });

export const PROFESIONALES = [
  P('ruiz',    'Dra. Marina Ruiz',     'Dra. Ruiz',    'Psicología', 'Psicóloga', 'Godoy Cruz', 'Centro', 1.2, 4.6, 23, 'menta',
    [cob('OSEP','verificada',-288), cob('OSDE','verificada',-192), cob('Particular','declarada',null)]),
  P('herrera', 'Lic. Tomás Herrera',   'Lic. Herrera', 'Psicología', 'Psicólogo', 'Godoy Cruz', 'Villa Hipódromo', 2.0, 4.8, 41, 'lavanda',
    [cob('OSEP','verificada',-120)]),
  P('sosa',    'Lic. Paula Sosa',      'Lic. Sosa',    'Psicología', 'Psicóloga', 'Godoy Cruz', 'Centro', 2.4, 4.4, 17, 'cielo',
    [cob('OSEP','verificada',-216)]),
  P('benitez', 'Lic. Carla Benítez',   'Lic. Benítez', 'Psicología', 'Psicóloga', 'Godoy Cruz', 'San Francisco del Monte', 3.1, 4.7, 29, 'durazno',
    [cob('OSEP','verificada',-72)]),
  P('molina',  'Lic. Andrés Molina',   'Lic. Molina',  'Psicología', 'Psicólogo', 'Godoy Cruz', 'Las Tortugas', 3.6, 4.3, 12, 'menta',
    [cob('OSEP','verificada',-240), cob('OSDE','verificada',-240)]),
  P('quiroga', 'Lic. Julieta Quiroga', 'Lic. Quiroga', 'Psicología', 'Psicóloga', 'Godoy Cruz', 'Trapiche', 4.0, 4.9, 35, 'lavanda',
    [cob('OSEP','verificada',-48)]),
  P('ferrari', 'Lic. Martín Ferrari',  'Lic. Ferrari', 'Psicología', 'Psicólogo', 'Godoy Cruz', 'Villa Marini', 4.5, 4.2, 9, 'cielo',
    [cob('OSEP','declarada',null)]),
  P('aguirre', 'Lic. Sofía Aguirre',   'Lic. Aguirre', 'Psicología', 'Psicóloga', 'Godoy Cruz', 'Benegas', 5.2, 4.5, 21, 'durazno',
    [cob('OSEP','verificada',-360)]),
  P('rossi',   'Lic. Diego Rossi',     'Lic. Rossi',   'Psicología', 'Psicólogo', 'Godoy Cruz', 'Centro', 1.8, 4.6, 14, 'menta',
    [cob('OSDE','verificada',-100)]),
  P('vidal',   'Lic. Natalia Vidal',   'Lic. Vidal',   'Psicología', 'Psicóloga', 'Ciudad de Mendoza', 'Quinta Sección', 6.0, 4.5, 19, 'lavanda',
    [cob('OSEP','verificada',-150)]),
  P('gomez',   'Dra. Silvia Gómez',    'Dra. Gómez',   'Clínica médica', 'Médica clínica', 'Luján de Cuyo', 'Centro', 9.5, 4.1, 18, 'cielo',
    [cob('OSDE','en_disputa',-24,-17), cob('Particular','declarada',null)]),
  P('paez',    'Dr. Ignacio Páez',     'Dr. Páez',     'Pediatría', 'Pediatra', 'Godoy Cruz', 'Centro', 1.5, 4.8, 52, 'durazno',
    [cob('OSEP','verificada',-96), cob('OSDE','verificada',-96)]),
  P('lucero',  'Lic. Romina Lucero',   'Lic. Lucero',  'Nutrición', 'Nutricionista', 'Guaymallén', 'Villa Nueva', 7.0, 4.4, 11, 'menta',
    [cob('OSEP','verificada',-144)]),
];

// Cartillas "leídas" por A3. OJO: la cartilla de OSEP YA NO incluye a 'ruiz' (es lo que dispara la demo).
export const CARTILLAS = {
  OSEP: ['herrera','sosa','benitez','molina','quiroga','ferrari','aguirre','vidal','paez','lucero'],
  OSDE: ['ruiz','molina','rossi','gomez','paez'],
};

// estado: 'pendiente' | 'aprobado' | 'rechazado'. `aprobado` se mantiene en sincronía para quien solo lee ese campo.
const A = (id, titulo, texto, especialidad, zona, estado, hora, motivo = null) =>
  ({ id, titulo, texto, especialidad, zona, estado, aprobado: estado === 'aprobado', hora, motivo });

export const ANUNCIOS = [
  A('a1', 'Centro Andino de Salud Mental', 'Turnos de psicología en Godoy Cruz.', 'Psicología', 'Godoy Cruz', 'aprobado', -400),
  A('a2', 'Nutrición Integral Mendoza', 'Primera consulta de seguimiento sin cargo para afiliados.', 'Nutrición', 'Guaymallén', 'pendiente', -30),
  A('a3', 'Terapia exprés', 'Curamos la ansiedad en 3 sesiones, resultado garantizado.', 'Psicología', 'Ciudad de Mendoza', 'pendiente', -12),
  A('a4', 'Pediatría a domicilio', 'Visitas en el día para todo Gran Mendoza.', 'Pediatría', 'Godoy Cruz', 'rechazado', -200,
    'No se puede verificar el servicio a domicilio.'),
];

// Datos de contacto y de consultorio que edita cada profesional en «Mi perfil».
const perfil = (telefono, direccion, honorario, modalidad, bio, aceptaNuevos = true) =>
  ({ telefono, direccion, honorario, modalidad, bio, aceptaNuevos });

export const PERFILES = {
  ruiz: perfil('261 555-0142', 'San Martín 1240, Godoy Cruz', '28000', 'Presencial y online',
    'Psicóloga clínica. Trabajo con adultos en ansiedad y duelo, con un enfoque cognitivo-conductual.'),
  gomez: perfil('261 555-0177', 'Ruta 40 km 3, Luján de Cuyo', '32000', 'Presencial',
    'Médica clínica con foco en seguimiento de enfermedades crónicas.'),
};
export const PERFIL_VACIO = perfil('', '', '', 'Presencial', '');

// estado: 'vigente' | 'por_vencer' | 'observada' | 'suspendida'. `vence` y `revisadaEn` están en horas de la demo.
const COLEGIO = { 'Psicología': 'Colegio de Psicólogos', 'Clínica médica': 'Colegio Médico', 'Pediatría': 'Colegio Médico', 'Nutrición': 'Colegio de Nutricionistas' };
const ESTADO_MATRICULA_INICIAL = { ferrari: 'por_vencer', gomez: 'observada' };

export const MATRICULAS = Object.fromEntries(PROFESIONALES.map((p, i) => {
  const estado = ESTADO_MATRICULA_INICIAL[p.id] ?? 'vigente';
  return [p.id, {
    numero: `MP ${3200 + i * 173}`,
    colegio: COLEGIO[p.especialidad],
    estado,
    vence: estado === 'por_vencer' ? 24 * 20 : 24 * (400 + i * 15),
    revisadaEn: -24 * (3 + i),
  }];
}));

// Umbrales que usa A1/A3 para abrir una disputa (los lee reglas.reportarNoAtiende).
export const REGLAS_INICIALES = { umbralReportes: 3, ventanaDias: 7 };

export function crearEstadoInicial() {
  return {
    version: 2,
    ahora: 0,
    pacienteActual: 'pac1',
    profesionalActual: 'ruiz',
    profesionales: structuredClone(PROFESIONALES),
    cartillas: structuredClone(CARTILLAS),
    anuncios: structuredClone(ANUNCIOS),
    perfiles: structuredClone(PERFILES),
    matriculas: structuredClone(MATRICULAS),
    reglas: { ...REGLAS_INICIALES },
    bitacora: [],
    reportes: [
      { id: 'rep1', profId: 'gomez', obraSocial: 'OSDE', pacienteId: 'pac2', hora: -96 },
      { id: 'rep2', profId: 'gomez', obraSocial: 'OSDE', pacienteId: 'pac3', hora: -48 },
      { id: 'rep3', profId: 'gomez', obraSocial: 'OSDE', pacienteId: 'pac4', hora: -24 },
    ],
    resenas: [
      { id: 'res1', profId: 'ruiz', pacienteId: 'pac9', puntaje: 5, hora: -336, estado: 'publicada',
        texto: 'Muy clara y puntual. Me ayudó a ordenar el tratamiento desde la primera consulta.', moderacion: null, mensajeOperador: null,
        respuesta: { texto: 'Gracias por tu comentario, me alegra que te haya servido.', hora: -330 } },
      { id: 'res2', profId: 'ruiz', pacienteId: 'pac6', puntaje: 4, hora: -190, estado: 'publicada',
        texto: 'Escucha con atención y explica bien cada paso. Los turnos a veces se demoran unos minutos.', moderacion: null, mensajeOperador: null },
      { id: 'res3', profId: 'ruiz', pacienteId: 'pac7', puntaje: 5, hora: -70, estado: 'publicada',
        texto: 'Me sentí cómodo desde la primera sesión. Muy recomendable.', moderacion: null, mensajeOperador: null },
      { id: 'res4', profId: 'herrera', pacienteId: 'pac1', puntaje: 5, hora: -120, estado: 'publicada',
        texto: 'Cálido y profesional. Las sesiones online funcionan muy bien.', moderacion: null, mensajeOperador: null },
      { id: 'res5', profId: 'paez', pacienteId: 'pac1', puntaje: 4, hora: -400, estado: 'publicada',
        texto: 'Atendió a mi hija con paciencia. Recomendable.', moderacion: null, mensajeOperador: null },
    ],
    alertas: [],
    casos: [
      { id: 'caso1', tipo: 'disputa', estado: 'abierto', etapa: 'cola_operador', profId: 'gomez', obraSocial: 'OSDE',
        creado: -17, enColaDesde: -17, resenaId: null, alertaId: null, decision: null,
        registro: [
          { n: '1', de: 'A3', a: 'A1', tipo: 'informar', texto: 'OSDE verificada en la cartilla (vía base).', hora: -24 },
          { n: '2', de: 'A1', a: 'A3', tipo: 'informar', texto: '3 reportes «no atiende mi cobertura» en 7 días (vía base).', hora: -17 },
          { n: '3', de: 'A3', a: 'A1', tipo: 'informar', texto: 'OSDE pasa a «en disputa», con aviso.', hora: -17 },
          { n: '4', de: 'A3', a: 'Operador', tipo: 'proponer', texto: 'Sacar OSDE del perfil (vía cola).', hora: -17 },
        ] },
    ],
    siguienteId: 100,
  };
}
