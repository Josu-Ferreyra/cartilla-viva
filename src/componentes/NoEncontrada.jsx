import Header from './Header.jsx';

export default function NoEncontrada() {
  return (
    <div className="cv-pagina">
      <Header variante="paciente" />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1 cv-titulo-1--m">No encontramos esta página</h1>
        <p className="cv-subtitulo"><a href="#/">Volver al inicio</a></p>
      </main>
    </div>
  );
}
