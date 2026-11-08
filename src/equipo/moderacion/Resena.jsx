import Header from '../../componentes/Header.jsx';
import Pendiente from '../../componentes/Pendiente.jsx';
import './moderacion.css';

export default function Resena({ profId }) {
  return (
    <div className="cv-pagina">
      <Header variante="paciente" volver={{ href: `#/perfil/${profId}`, texto: '← Volver al perfil' }} />
      <main className="cv-contenedor cv-main">
        <Pendiente nombre={`Reseña (${profId})`} area="02" />
      </main>
    </div>
  );
}
