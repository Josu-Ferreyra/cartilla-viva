import { useRuta } from './core/ruta.js';
import { useApp } from './core/store.jsx';
import Busqueda from './equipo/paciente/Busqueda.jsx';
import Perfil from './equipo/paciente/Perfil.jsx';
import Resena from './equipo/moderacion/Resena.jsx';
import Profesional from './equipo/coberturas/Profesional.jsx';
import PanelPresentador from './equipo/coberturas/PanelPresentador.jsx';
import OperadorPage from './componentes/OperadorPage.jsx';
import NoEncontrada from './componentes/NoEncontrada.jsx';

export default function App() {
  const [seccion, id] = useRuta();
  const { estado } = useApp();
  let pagina;
  switch (seccion) {
    case undefined: pagina = <Busqueda />; break;
    case 'perfil': pagina = <Perfil profId={id} />; break;
    case 'resena': pagina = <Resena profId={id} />; break;
    case 'profesional': pagina = <Profesional profId={id ?? estado.profesionalActual} />; break;
    case 'operador': pagina = <OperadorPage casoId={id} />; break;
    default: pagina = <NoEncontrada />;
  }
  return (<>{pagina}<PanelPresentador /></>);
}
