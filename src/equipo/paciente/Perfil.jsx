import Header from '../../componentes/Header.jsx';
import Pendiente from '../../componentes/Pendiente.jsx';
import './paciente.css';

export default function Perfil({ profId }) {
  return (
    <div className="cv-pagina">
      <Header variante="paciente" volver={{ href: '#/', texto: '← Volver a la búsqueda' }} />
      <main className="cv-contenedor cv-main">
        <Pendiente nombre={`Perfil (${profId})`} area="01" />
      </main>
    </div>
  );
}
