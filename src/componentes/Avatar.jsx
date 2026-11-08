export default function Avatar({ iniciales, tono, tam = 52 }) {
  const hayTono = ['menta', 'manteca', 'durazno', 'rosa', 'lavanda', 'cielo'].includes(tono);
  const estilo = {
    width: tam,
    height: tam,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontWeight: 600,
    fontSize: tam * 0.29,
    background: hayTono ? `var(--${tono}-fondo)` : 'var(--cv-superficie-suave)',
    color: hayTono ? `var(--${tono}-texto)` : 'var(--cv-tenue)',
  };
  return <span aria-hidden="true" style={estilo}>{iniciales}</span>;
}
