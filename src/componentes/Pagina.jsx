import Header from './Header.jsx';

// Marco común de las secciones del menú: header, título y cuerpo.
export default function Pagina({ variante, activo, titulo, subtitulo, children }) {
  const operador = variante === 'operador';
  return (
    <div className="cv-pagina">
      <Header variante={variante} activo={activo} />
      <main className={`cv-contenedor${operador ? ' cv-contenedor--ancho' : ''} cv-main`}>
        <h1 className={`cv-titulo-1${operador ? ' cv-titulo-1--m' : ''}`}>{titulo}</h1>
        {subtitulo && <p className="cv-subtitulo">{subtitulo}</p>}
        {children}
      </main>
    </div>
  );
}
