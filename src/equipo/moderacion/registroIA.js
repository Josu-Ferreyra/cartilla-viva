// Registro de llamadas de A2 en el navegador (evidencia dentro de la app). Solo navegador.
const CLAVE = 'cartilla-viva-log-ia';
const MAXIMO = 50;

export function leer() {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

// entrada = { fecha: ISO, texto, fuente, modelo, ms, decision, motivos, error }
export function registrar(entrada) {
  console.info('[A2]', entrada);
  try {
    const lista = [...leer(), entrada].slice(-MAXIMO);
    window.localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch { /* sin localStorage: queda solo en la consola */ }
}

export function limpiar() {
  try { window.localStorage.removeItem(CLAVE); } catch { /* nada que limpiar */ }
}
