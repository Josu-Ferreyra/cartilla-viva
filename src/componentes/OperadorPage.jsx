import Header from './Header.jsx';
import Chip from './Chip.jsx';
import { useApp, selCasosOrdenados, selProf } from '../core/store.jsx';
import { TIPO_CASO, venceEn, diaDeSiete, conArticulo } from '../core/formato.js';
import DetalleResena from '../equipo/moderacion/DetalleResena.jsx';
import DetalleSinConfirmar from '../equipo/coberturas/DetalleSinConfirmar.jsx';
import DetalleDisputa from '../equipo/coberturas/DetalleDisputa.jsx';

function tituloCaso(estado, caso) {
  const prof = selProf(estado, caso.profId);
  if (!prof) return caso.id;
  return caso.tipo === 'resena_retenida'
    ? `Reseña sobre ${conArticulo(prof, true)}`
    : `${prof.nombreCorto} · ${caso.obraSocial}`;
}

function lineaCaso(caso) {
  if (caso.tipo === 'resena_retenida') return 'A2 · Moderador';
  if (caso.tipo === 'disputa') return 'A1 y A3 no coinciden';
  if (caso.etapa === 'esperando_profesional') return 'A3 · Verificador · esperando a la profesional';
  if (caso.etapa === 'cola_operador') return 'A3 · Verificador · para el operador';
  return 'A3 · Verificador';
}

function Detalle({ caso }) {
  switch (caso.tipo) {
    case 'resena_retenida': return <DetalleResena caso={caso} />;
    case 'cobertura_sin_confirmar': return <DetalleSinConfirmar caso={caso} />;
    case 'disputa': return <DetalleDisputa caso={caso} />;
    default: return null;
  }
}

export default function OperadorPage({ casoId }) {
  const { estado } = useApp();
  const casos = selCasosOrdenados(estado);
  const caso = casos.find((c) => c.id === casoId) ?? casos[0];

  return (
    <div className="cv-pagina">
      <Header variante="operador" activo="Cola" />
      <main className="cv-contenedor cv-contenedor--ancho cv-main">
        <h1 className="cv-titulo-1 cv-titulo-1--m">Cola de revisión</h1>
        <p className="cv-subtitulo">Los agentes proponen, una persona decide. Cada caso se resuelve en 48 h.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginTop: 48, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 380 }}>
            <nav aria-label="Casos" className="cv-pila">
              {casos.map((c) => {
                const resuelto = c.estado === 'resuelto';
                const tipo = TIPO_CASO[c.tipo];
                return (
                  <a key={c.id} className="cv-caso" href={`#/operador/${c.id}`} aria-current={c.id === caso?.id ? 'true' : undefined}>
                    <span className="cv-fila" style={{ justifyContent: 'space-between' }}>
                      <Chip tono={resuelto ? 'gris' : tipo.tono} chico>{resuelto ? 'Resuelto' : tipo.texto}</Chip>
                      {c.etapa === 'cola_operador' && <span className="cv-meta">{venceEn(c, estado.ahora)}</span>}
                      {c.etapa === 'esperando_profesional' && <span className="cv-meta">{diaDeSiete(c, estado.ahora)}</span>}
                    </span>
                    <span className="cv-caso__titulo">{tituloCaso(estado, c)}</span>
                    <span className="cv-meta">{lineaCaso(c)}</span>
                  </a>
                );
              })}
            </nav>

            {caso && (
              <section aria-label="Registro del caso" style={{ padding: '0 24px', marginTop: 32 }}>
                <p className="cv-eyebrow">Registro del caso</p>
                <ol style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {caso.registro.map((m, i) => (
                    <li key={`${m.n}-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 24, color: m.n.startsWith('D') ? 'var(--menta-texto)' : 'var(--cv-tenue)' }}>{m.n}</span>
                      <span style={{ fontSize: 14, color: 'var(--cv-tinta-2)' }}>{m.de} → {m.a} · {m.tipo}: {m.texto}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <div style={{ flex: '999 1 560px', minWidth: 0 }}>
            <section className="cv-panel cv-pila cv-gap-32" aria-label="Detalle del caso">
              {caso ? <Detalle key={caso.id} caso={caso} /> : <p className="cv-texto">No hay casos en la cola.</p>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
