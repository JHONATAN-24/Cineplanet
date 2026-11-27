// Encuesta de satisfacción CSAT (1-5 estrellas)
import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Button from '../ui/Button';
import type { EncuestaSatisfaccion } from '../../types';

interface Props {
  ticketId: string;
  clienteId: string;
  onEnviar: (encuesta: EncuestaSatisfaccion) => Promise<void>;
  enviada?: boolean;
  calificacionActual?: number;
}

const ETIQUETAS = ['', 'Muy insatisfecho', 'Insatisfecho', 'Regular', 'Satisfecho', 'Muy satisfecho'];

export default function EncuestaCsat({ ticketId, clienteId, onEnviar, enviada, calificacionActual }: Props) {
  const [calificacion, setCalificacion] = useState<1 | 2 | 3 | 4 | 5>(calificacionActual as 1 ?? 0 as unknown as 1);
  const [hovered, setHovered] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!calificacion) return;
    setEnviando(true);
    const encuesta: EncuestaSatisfaccion = {
      id: `csat-${ticketId}-${Date.now()}`,
      ticketId,
      usuarioId: clienteId,
      calificacion,
      comentario: comentario.trim() || undefined,
      fecha: new Date().toISOString(),
    };
    await onEnviar(encuesta);
    setEnviando(false);
  };

  if (enviada) {
    return (
      <div className="bg-green-50 border border-accent-green/30 rounded-2xl p-5 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={22}
              className={s <= (calificacionActual ?? 0) ? 'text-accent-yellow fill-accent-yellow' : 'text-app-border'}
            />
          ))}
        </div>
        <p className="text-sm font-bold text-accent-green mb-1">¡Gracias por tu calificación!</p>
        <p className="text-xs text-app-muted">Tu opinión nos ayuda a mejorar el servicio.</p>
      </div>
    );
  }

  return (
    <div className="bg-accent-yellow/5 border border-accent-yellow/30 rounded-2xl p-5">
      <h3 className="font-bold text-app-text mb-1 text-sm">¿Cómo calificas la atención recibida?</h3>
      <p className="text-xs text-app-muted mb-4">Tu opinión mejora nuestro servicio.</p>

      {/* Estrellas */}
      <div className="flex justify-center gap-2 mb-2" role="group" aria-label="Calificación de 1 a 5 estrellas">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setCalificacion(s as 1 | 2 | 3 | 4 | 5)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${s} estrella${s !== 1 ? 's' : ''} — ${ETIQUETAS[s]}`}
            aria-pressed={calificacion === s}
            className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Star
              size={32}
              className={
                s <= (hovered || calificacion)
                  ? 'text-accent-yellow fill-accent-yellow transition-colors'
                  : 'text-app-border transition-colors'
              }
            />
          </button>
        ))}
      </div>

      {calificacion > 0 && (
        <p className="text-center text-xs text-app-muted mb-4">{ETIQUETAS[calificacion]}</p>
      )}

      {/* Comentario */}
      <textarea
        placeholder="Comentario opcional... (¿qué podríamos mejorar?)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        maxLength={300}
        className="w-full text-sm border-2 border-app-border rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary resize-none mb-3"
        aria-label="Comentario de la encuesta"
      />

      <Button
        variante="primary"
        tamano="sm"
        icono={<Send size={14} />}
        onClick={handleEnviar}
        cargando={enviando}
        disabled={!calificacion}
        fullWidth
      >
        Enviar calificación
      </Button>
    </div>
  );
}
