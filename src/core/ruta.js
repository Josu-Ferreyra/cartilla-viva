import { useEffect, useState } from 'react';
function leer() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [camino] = h.split('?');
  return camino.split('/').filter(Boolean);
}
export function useRuta() {
  const [segmentos, setSegmentos] = useState(leer);
  useEffect(() => {
    const f = () => { setSegmentos(leer()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return segmentos;
}
export const irA = (ruta) => { window.location.hash = ruta; }; // irA('/perfil/ruiz')
