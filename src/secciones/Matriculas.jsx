import { useState } from 'react';
import Pagina from '../componentes/Pagina.jsx';
import Chip from '../componentes/Chip.jsx';
import { useApp } from '../core/store.jsx';
import { ESTADO_MATRICULA, enDias } from '../core/formato.js';
import './secciones.css';

const FILTROS = [['todas', 'Todas'], ...Object.entries(ESTADO_MATRICULA).map(([k, v]) => [k, v.texto])];
const VERBO = { vigente: 'revalidada', observada: 'marcada como observada', suspendida: 'suspendida', por_vencer: 'marcada por vencer' };

// Qué botones se ofrecen según el estado actual.
const ACCIONES = {
  vigente:    [['observada', 'Observar'], ['suspendida', 'Suspender']],
  por_vencer: [['vigente', 'Revalidar'], ['observada', 'Observar']],
  observada:  [['vigente', 'Revalidar'], ['suspendida', 'Suspender']],
  suspendida: [['vigente', 'Revalidar']],
};

export default function Matriculas() {
  const { estado, acciones } = useApp();
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [aviso, setAviso] = useState(null);

  const filas = estado.profesionales
    .filter((p) => estado.matriculas[p.id])
    .map((p) => ({ prof: p, mat: estado.matriculas[p.id] }));
  const cuenta = (est) => filas.filter((f) => f.mat.estado === est).length;
  const q = busqueda.trim().toLowerCase();
  const visibles = filas.filter(({ prof, mat }) =>
    (filtro === 'todas' || mat.estado === filtro) &&
    (!q || `${prof.nombre} ${mat.numero} ${prof.especialidad}`.toLowerCase().includes(q)));

  const cambiar = (prof, mat, nuevo) => {
    acciones.actualizarMatricula({ profId: prof.id, estado: nuevo });
    setAviso(`Matrícula ${mat.numero} de ${prof.nombre} ${VERBO[nuevo]}.`);
  };

  return (
    <Pagina
      variante="operador"
      activo="Matrículas"
      titulo="Matrículas"
      subtitulo="Estado de la matrícula de cada profesional. Una matrícula observada o suspendida deja de mostrar el sello de verificada."
    >
      <div className="sec-resumen">
        {Object.entries(ESTADO_MATRICULA).map(([clave, { texto, tono }]) => (
          <div key={clave} className="sec-tarjeta sec-tarjeta--chica">
            <Chip tono={tono} chico>{texto}</Chip>
            <p className="sec-resumen__n">{cuenta(clave)}</p>
          </div>
        ))}
      </div>

      <div className="sec-filtros" style={{ marginTop: 40 }}>
        <div className="sec-filtros" role="group" aria-label="Filtrar por estado">
          {FILTROS.map(([clave, texto]) => (
            <button key={clave} type="button" className="sec-filtro" aria-pressed={filtro === clave} onClick={() => setFiltro(clave)}>{texto}</button>
          ))}
        </div>
        <input
          className="sec-input sec-buscar"
          type="search"
          placeholder="Buscar por nombre o número"
          aria-label="Buscar matrícula"
          value={busqueda}
          onChange={(ev) => setBusqueda(ev.target.value)}
        />
      </div>

      <div role="status" style={{ marginTop: 16 }}>
        {aviso && (
          <div className="cv-aviso cv-aviso--menta">
            <p className="cv-aviso__titulo">{aviso}</p>
          </div>
        )}
      </div>

      <div className="sec-tarjeta sec-filas" style={{ marginTop: 16, padding: 0 }}>
        <div className="sec-fila sec-fila--matricula sec-fila--cabecera" aria-hidden="true">
          <span>Profesional</span><span>Matrícula</span><span>Vence</span><span>Estado</span><span />
        </div>
        {visibles.length === 0 && <p className="sec-texto sec-vacio">No hay matrículas que coincidan.</p>}
        {visibles.map(({ prof, mat }) => (
          <div key={prof.id} className="sec-fila sec-fila--matricula">
            <div>
              <div className="sec-principal">{prof.nombre}</div>
              <div className="sec-secundario">{prof.especialidad}</div>
            </div>
            <div>
              <div className="sec-principal">{mat.numero}</div>
              <div className="sec-secundario">{mat.colegio}</div>
            </div>
            <div>
              <div className="sec-principal">{enDias(mat.vence, estado.ahora)}</div>
              <div className="sec-secundario">revisada {enDias(mat.revisadaEn, estado.ahora)}</div>
            </div>
            <Chip tono={ESTADO_MATRICULA[mat.estado].tono}>{ESTADO_MATRICULA[mat.estado].texto}</Chip>
            <div className="sec-acciones">
              {ACCIONES[mat.estado].map(([nuevo, texto]) => (
                <button
                  key={nuevo}
                  type="button"
                  className={`cv-boton cv-boton--chico ${nuevo === 'vigente' ? 'cv-boton--primario' : 'cv-boton--secundario'}`}
                  aria-label={`${texto} matrícula de ${prof.nombre}`}
                  onClick={() => cambiar(prof, mat, nuevo)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Pagina>
  );
}
