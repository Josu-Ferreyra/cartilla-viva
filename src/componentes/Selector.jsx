import { useEffect, useId, useRef, useState } from 'react';

// Lista desplegable propia (patrón "select-only combobox" de ARIA): reemplaza al <select> nativo,
// cuyo menú no se puede estilizar. `variante="barra"` es la versión sin fondo para la barra de búsqueda.
export default function Selector({ id, value, onChange, opciones, variante = 'campo', ...aria }) {
  const idAuto = useId();
  const idLista = `${id ?? idAuto}-lista`;
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const raiz = useRef(null);
  const lista = useRef(null);
  const escrito = useRef({ texto: '', hasta: 0 });

  const seleccionado = Math.max(0, opciones.indexOf(value));

  const abrir = (indice = seleccionado) => {
    setActivo(indice);
    setAbierto(true);
  };
  const elegir = (indice) => {
    onChange(opciones[indice]);
    setAbierto(false);
  };

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (ev) => { if (!raiz.current?.contains(ev.target)) setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [abierto]);

  useEffect(() => {
    if (abierto) lista.current?.children[activo]?.scrollIntoView({ block: 'nearest' });
  }, [abierto, activo]);

  const alTeclear = (ev) => {
    const ultimo = opciones.length - 1;
    const mover = (indice) => { ev.preventDefault(); setActivo(Math.min(ultimo, Math.max(0, indice))); };

    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(ev.key)) { ev.preventDefault(); abrir(); }
      return;
    }
    switch (ev.key) {
      case 'ArrowDown': mover(activo + 1); break;
      case 'ArrowUp': mover(activo - 1); break;
      case 'Home': mover(0); break;
      case 'End': mover(ultimo); break;
      case 'Enter': case ' ': ev.preventDefault(); elegir(activo); break;
      case 'Escape': ev.preventDefault(); setAbierto(false); break;
      case 'Tab': setAbierto(false); break;
      default:
        if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
          const ahora = Date.now();
          const texto = (ahora < escrito.current.hasta ? escrito.current.texto : '') + ev.key.toLowerCase();
          escrito.current = { texto, hasta: ahora + 700 };
          const coincide = opciones.findIndex((op) => op.toLowerCase().startsWith(texto));
          if (coincide >= 0) setActivo(coincide);
        }
    }
  };

  return (
    <div ref={raiz} className={`cv-selector cv-selector--${variante}`}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-activedescendant={abierto ? `${idLista}-${activo}` : undefined}
        className="cv-selector__boton"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alTeclear}
        {...aria}
      >
        <span className="cv-selector__valor">{value}</span>
        <svg className="cv-selector__flecha" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {abierto && (
        <ul ref={lista} id={idLista} role="listbox" className="cv-selector__lista" tabIndex={-1}>
          {opciones.map((op, i) => (
            <li
              key={op}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={op === value}
              className={`cv-selector__opcion${i === activo ? ' cv-selector__opcion--activa' : ''}`}
              onPointerEnter={() => setActivo(i)}
              onPointerDown={(ev) => ev.preventDefault()}
              onClick={() => elegir(i)}
            >
              <span>{op}</span>
              {op === value && (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
