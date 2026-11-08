import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { crearEstadoInicial } from './datos.js';
import * as reglas from './reglas.js';

const CLAVE = 'cartilla-viva-v1';

function cargar() {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const e = JSON.parse(crudo);
      if (e && e.version === 1 && Array.isArray(e.casos) && Array.isArray(e.profesionales)) return e;
    }
  } catch { /* JSON inválido o localStorage no disponible: arranca de cero */ }
  return crearEstadoInicial();
}

function reducer(estado, accion) {
  const p = accion.payload;
  switch (accion.tipo) {
    case 'reportarNoAtiende': return reglas.reportarNoAtiende(estado, p);
    case 'ejecutarVerificacion': return reglas.ejecutarVerificacion(estado);
    case 'responderAlerta': return reglas.responderAlerta(estado, p);
    case 'avanzarHoras': return reglas.avanzarHoras(estado, p);
    case 'confirmarDecisionOperador': return reglas.confirmarDecisionOperador(estado, p);
    case 'resolverDisputa': return reglas.resolverDisputa(estado, p);
    case 'enviarResena': return reglas.enviarResena(estado, p);
    case 'resolverResena': return reglas.resolverResena(estado, p);
    case 'reiniciar': return reglas.reiniciar();
    default: return estado;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, null, cargar);

  const acciones = useMemo(() => ({
    reportarNoAtiende: (p) => dispatch({ tipo: 'reportarNoAtiende', payload: p }),
    ejecutarVerificacion: () => dispatch({ tipo: 'ejecutarVerificacion' }),
    responderAlerta: (p) => dispatch({ tipo: 'responderAlerta', payload: p }),
    avanzarHoras: (horas) => dispatch({ tipo: 'avanzarHoras', payload: { horas } }),
    confirmarDecisionOperador: (p) => dispatch({ tipo: 'confirmarDecisionOperador', payload: p }),
    resolverDisputa: (p) => dispatch({ tipo: 'resolverDisputa', payload: p }),
    enviarResena: (p) => dispatch({ tipo: 'enviarResena', payload: p }),
    resolverResena: (p) => dispatch({ tipo: 'resolverResena', payload: p }),
    reiniciar: () => dispatch({ tipo: 'reiniciar' }),
  }), [dispatch]);

  useEffect(() => {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin persistencia */ }
    if (import.meta.env.DEV) window.__cv = { estado, acciones };
  }, [estado, acciones]);

  const valor = useMemo(() => ({ estado, acciones }), [estado, acciones]);
  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}

// Selectores (funciones puras)
export const selProf = (estado, id) => estado.profesionales.find((p) => p.id === id);
export const selCaso = (estado, id) => estado.casos.find((c) => c.id === id);
export const selResena = (estado, id) => estado.resenas.find((r) => r.id === id);
export const selCasosOrdenados = (estado) => {
  const base = (c) => c.enColaDesde ?? c.creado;
  const abiertos = estado.casos.filter((c) => c.estado === 'abierto').sort((a, b) => base(a) - base(b));
  const resueltos = estado.casos.filter((c) => c.estado !== 'abierto').sort((a, b) => base(b) - base(a));
  return [...abiertos, ...resueltos];
};
export const selAlertasPendientes = (estado, profId) =>
  estado.alertas.filter((a) => a.profId === profId && a.estado === 'pendiente');
export const selResenasPublicadas = (estado, profId) =>
  estado.resenas.filter((r) => r.profId === profId && r.estado === 'publicada').reverse().sort((a, b) => b.hora - a.hora);
// reverse() antes de sort(): con la misma hora gana la que se creó última
export const selUltimaResenaDelPaciente = (estado, profId) =>
  estado.resenas
    .filter((r) => r.profId === profId && r.pacienteId === estado.pacienteActual)
    .reverse()
    .sort((a, b) => b.hora - a.hora)[0] ?? null;
export const selReportesDelPaciente = (estado, profId) =>
  estado.reportes.filter((r) => r.profId === profId && r.pacienteId === estado.pacienteActual);
