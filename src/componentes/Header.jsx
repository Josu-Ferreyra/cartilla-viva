import { useApp, selAlertasPendientes } from '../core/store.jsx';

const LOGO = (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <rect width="28" height="28" rx="14" fill="#CBE6DA" />
    <path d="M14 8.5v11M8.5 14h11" stroke="#1E5A48" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const INICIO = { paciente: '#/', profesional: '#/profesional', operador: '#/operador' };
const ROL = { paciente: null, profesional: 'Profesionales', operador: 'Operador' };

function itemsNav(variante, nAlertas, nAbiertos) {
  switch (variante) {
    case 'profesional':
      return [
        { clave: 'Alertas', texto: `Alertas (${nAlertas})`, href: '#/profesional' },
        { clave: 'Mi perfil', texto: 'Mi perfil', href: '#/mi-perfil' },
        { clave: 'Reseñas', texto: 'Reseñas', href: '#/resenas-recibidas' },
      ];
    case 'operador':
      return [
        { clave: 'Cola', texto: `Cola (${nAbiertos} abiertos)`, href: '#/operador' },
        { clave: 'Matrículas', texto: 'Matrículas', href: '#/matriculas' },
        { clave: 'Avisos', texto: 'Avisos', href: '#/avisos' },
        { clave: 'Reglas', texto: 'Reglas', href: '#/reglas' },
        { clave: 'Registro', texto: 'Registro', href: '#/registro' },
      ];
    default:
      return [
        { clave: 'Buscar', texto: 'Buscar', href: '#/' },
        { clave: 'Mis reseñas', texto: 'Mis reseñas', href: '#/mis-resenas' },
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
              href={it.href}
              aria-current={it.clave === activo ? 'page' : undefined}
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
