import Header from '../../componentes/Header.jsx';
import Pendiente from '../../componentes/Pendiente.jsx';
import './paciente.css';

export default function Busqueda() {
  return (
    <div className="cv-pagina">
      <Header variante="paciente" activo="Buscar" />
      <main className="cv-contenedor cv-main">
        <Pendiente nombre="Búsqueda" area="01" />
      </main>
    </div>
  );
}
