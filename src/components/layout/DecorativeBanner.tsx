// Franja decorativa inspirada en los bloques inclinados del logo
// Degradé: magenta → rojo → naranja → amarillo → verde → turquesa
export default function DecorativeBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex gap-1.5 h-full items-center">
        {[
          '#B5127F', '#CB2054', '#D1592B', '#DE9430',
          '#FAE93F', '#9CC450', '#30A67D', '#15A9B8',
        ].map((color, i) => (
          <div
            key={i}
            className="rounded-lg flex-1"
            style={{
              backgroundColor: color,
              transform: 'skewX(-12deg)',
              height: '100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
