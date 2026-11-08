import { useState } from 'react';
import Header from '../../componentes/Header.jsx';
import Estrellas from '../../componentes/Estrellas.jsx';
import { useApp, selProf, selResenasPublicadas } from '../../core/store.jsx';
import { haceTiempo, numero, conArticulo } from '../../core/formato.js';
import './paciente.css';

const ESTRELLAS = [5, 4, 3, 2, 1];
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

export default function ResenasProfesional({ profId }) {
  const { estado } = useApp();
  const [filtro, setFiltro] = useState('todas');
  const prof = selProf(estado, profId);

  if (!prof) {
    return (
      <div className="cv-pagina">
        <Header variante="paciente" volver={{ href: '#/', texto: '← Volver a resultados' }} />
        <main className="cv-contenedor cv-main">
          <div className="cv-panel cv-pila cv-gap-16">
            <h1 className="cv-titulo-2">No encontramos este perfil</h1>
            <a href="#/">Volver a la búsqueda</a>
          </div>
        </main>
      </div>
    );
  }

  const publicadas = selResenasPublicadas(estado, prof.id);
  const cuenta = (n) => publicadas.filter((r) => r.puntaje === n).length;
  const lista = filtro === 'todas' ? publicadas : publicadas.filter((r) => r.puntaje === filtro);

  return (
    <div className="cv-pagina">
      <Header variante="paciente" volver={{ href: `#/perfil/${prof.id}`, texto: '← Volver al perfil' }} />
      <main className="cv-contenedor cv-main">
        <h1 className="cv-titulo-1 cv-titulo-1--m">Reseñas sobre {conArticulo(prof)}</h1>
        <p className="cv-subtitulo">
          {numero(prof.rating)} de 5 · {publicadas.length} {plural(publicadas.length, 'reseña publicada', 'reseñas publicadas')}
        </p>

        <div className="pac-resenas-lista cv-pila cv-gap-16">
          <div className="pac-filtros" role="group" aria-label="Filtrar por estrellas">
            <button type="button" className="pac-filtro" aria-pressed={filtro === 'todas'} onClick={() => setFiltro('todas')}>
              Todas ({publicadas.length})
            </button>
            {ESTRELLAS.map((n) => (
              <button
                key={n}
                type="button"
                className="pac-filtro"
                aria-pressed={filtro === n}
                aria-label={`${n} ${plural(n, 'estrella', 'estrellas')}, ${cuenta(n)} ${plural(cuenta(n), 'reseña', 'reseñas')}`}
                onClick={() => setFiltro(n)}
              >
                {n} ★ ({cuenta(n)})
              </button>
            ))}
          </div>

          <div className="cv-pila cv-gap-16">
            {lista.length === 0 ? (
              <div className="cv-tarjeta pac-resenas">
                <p className="pac-vacio">
                  {filtro === 'todas'
                    ? 'Todavía no hay reseñas publicadas.'
                    : `No hay reseñas de ${filtro} ${plural(filtro, 'estrella', 'estrellas')}.`}
                </p>
              </div>
            ) : lista.map((r) => (
              <article key={r.id} className="cv-tarjeta pac-resenas pac-resena-completa" aria-label={`Reseña de ${r.puntaje} ${plural(r.puntaje, 'estrella', 'estrellas')}`}>
                <div className="cv-fila cv-gap-12">
                  <Estrellas valor={r.puntaje} />
                  <span className="cv-meta">Paciente · {haceTiempo(r.hora, estado.ahora)}</span>
                </div>
                <p className="pac-resena__texto">{r.texto}</p>
                {r.respuesta && (
                  <div className="pac-resena__respuesta">
                    <span className="cv-eyebrow">Respuesta del profesional</span>
                    <p className="pac-resena__texto">{r.respuesta.texto}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
