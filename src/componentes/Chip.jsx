export default function Chip({ tono, chico = false, children }) {
  return <span className={`cv-chip cv-chip--${tono}${chico ? ' cv-chip--chico' : ''}`}>{children}</span>;
}
