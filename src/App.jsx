import { useRuta } from './core/ruta.js';
import { useApp } from './core/store.jsx';
import Busqueda from './equipo/paciente/Busqueda.jsx';
import Perfil from './equipo/paciente/Perfil.jsx';
import Resena from './equipo/moderacion/Resena.jsx';
import Profesional from './equipo/coberturas/Profesional.jsx';
import PanelPresentador from './equipo/coberturas/PanelPresentador.jsx';
import MisResenas from './secciones/MisResenas.jsx';
import MiPerfil from './secciones/MiPerfil.jsx';
import ResenasRecibidas from './secciones/ResenasRecibidas.jsx';
import Matriculas from './secciones/Matriculas.jsx';
import Avisos from './secciones/Avisos.jsx';
import Reglas from './secciones/Reglas.jsx';
import Registro from './secciones/Registro.jsx';
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
    case 'mis-resenas': pagina = <MisResenas />; break;
    case 'mi-perfil': pagina = <MiPerfil />; break;
    case 'resenas-recibidas': pagina = <ResenasRecibidas />; break;
    case 'matriculas': pagina = <Matriculas />; break;
    case 'avisos': pagina = <Avisos />; break;
    case 'reglas': pagina = <Reglas />; break;
    case 'registro': pagina = <Registro />; break;
    default: pagina = <NoEncontrada />;
  }
  return (<>{pagina}<PanelPresentador /></>);
}
