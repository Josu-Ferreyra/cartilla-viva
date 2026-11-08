export default function Estrellas({ valor }) {
  return (
    <span className="sec-estrellas" role="img" aria-label={`${valor} de 5`}>
      {'★'.repeat(valor)}<span className="sec-estrellas__vacias">{'★'.repeat(5 - valor)}</span>
    </span>
  );
}
