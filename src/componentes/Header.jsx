import { useApp, selAlertasPendientes } from '../core/store.jsx';

const LOGO = (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <rect width="28" height="28" rx="14" fill="#CBE6DA" />
    <path d="M14 8.5v11M8.5 14h11" stroke="#1E5A48" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const INICIO = { paciente: '#/', profesional: '#/profesional', operador: '#/operador' };
const ROL = { paciente: null, profesional: 'Profesionales', operador: 'Operador' };

// Los ítems con href null no tienen pantalla en la demo: se muestran pero no navegan.
function itemsNav(variante, nAlertas, nAbiertos) {
  switch (variante) {
    case 'profesional':
      return [
        { clave: 'Alertas', texto: `Alertas (${nAlertas})`, href: '#/profesional' },
        { clave: 'Mi perfil', texto: 'Mi perfil', href: null },
        { clave: 'Reseñas', texto: 'Reseñas', href: null },
      ];
    case 'operador':
      return [
        { clave: 'Cola', texto: `Cola (${nAbiertos} abiertos)`, href: '#/operador' },
        { clave: 'Matrículas', texto: 'Matrículas', href: null },
        { clave: 'Avisos', texto: 'Avisos', href: null },
        { clave: 'Reglas', texto: 'Reglas', href: null },
        { clave: 'Registro', texto: 'Registro', href: null },
      ];
    default:
      return [
        { clave: 'Buscar', texto: 'Buscar', href: '#/' },
        { clave: 'Mis reseñas', texto: 'Mis reseñas', href: null },
      ];
  }
}

export default function Header({ variante, volver, activo }) {
  const { estado } = useApp();
  const nAlertas = selAlertasPendientes(estado, estado.profesionalActual).length;
  const nAbiertos = estado.casos.filter((c) => c.estado === 'abierto').length;
  const rol = ROL[variante];

  return (
    <header className={`cv-contenedor${variante === 'operador' ? ' cv-contenedor--ancho' : ''} cv-header`}>
      <a className="cv-logo" href={INICIO[variante]}>
        {LOGO}
        <span>Cartilla Viva</span>
        {rol && <span className="cv-logo__rol">{rol}</span>}
      </a>
      {volver ? (
        <a className="cv-volver" href={volver.href}>{volver.texto}</a>
      ) : (
        <nav className="cv-nav" aria-label="Principal">
          {itemsNav(variante, nAlertas, nAbiertos).map((it) => (
            <a
              key={it.clave}
              href={it.href ?? '#'}
              aria-current={it.clave === activo ? 'page' : undefined}
              onClick={it.href ? undefined : (ev) => ev.preventDefault()}
            >
              {it.texto}
            </a>
          ))}
        </nav>
      )}
      <span className="cv-etiqueta-prueba">Datos de prueba</span>
    </header>
  );
}
