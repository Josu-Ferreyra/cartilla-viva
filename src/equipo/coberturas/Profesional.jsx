import Header from '../../componentes/Header.jsx';
import Pendiente from '../../componentes/Pendiente.jsx';
import './coberturas.css';

export default function Profesional({ profId }) {
  return (
    <div className="cv-pagina">
      <Header variante="profesional" activo="Alertas" />
      <main className="cv-contenedor cv-main">
        <Pendiente nombre={`Profesional (${profId})`} area="03" />
      </main>
    </div>
  );
}
