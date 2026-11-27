// ============================================================
// Configuración del motor de conciliación — responsive
// ============================================================
import { useEffect, useState } from 'react';
import { Save, RotateCcw, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { obtenerReglas, guardarReglas } from '../../services/conciliationService';
import { restablecerDemoData } from '../../services/seedService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import type { ReglasMotor } from '../../types';

export default function MotorConfigPage() {
  const { mostrar } = useToast();
  const [reglas, setReglas] = useState<ReglasMotor>({
    activo: true,
    umbralReembolsoAutomatico: 150,
    timeoutSegundos: 8,
    probabilidadConciliacion: 0.9,
    probabilidadReembolso: 0.05,
  });
  const [guardando, setGuardando] = useState(false);
  const [restableciendo, setRestableciendo] = useState(false);

  useEffect(() => { setReglas(obtenerReglas()); }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    try { await guardarReglas(reglas); mostrar('Reglas guardadas correctamente.', 'exito'); }
    catch { mostrar('Error al guardar.', 'error'); }
    finally { setGuardando(false); }
  };

  const handleRestablecer = async () => {
    setRestableciendo(true);
    try { restablecerDemoData(); setReglas(obtenerReglas()); mostrar('Datos demo restablecidos.', 'exito'); }
    catch { mostrar('Error al restablecer.', 'error'); }
    finally { setRestableciendo(false); }
  };

  const probManual = Math.max(0, +(1 - reglas.probabilidadConciliacion - reglas.probabilidadReembolso).toFixed(2));

  // Slider con etiqueta y valor
  const Slider = ({
    id, label, ayuda, min, max, step, valor, onChange, formato,
  }: {
    id: string; label: string; ayuda?: string;
    min: number; max: number; step: number;
    valor: number; onChange: (v: number) => void;
    formato: (v: number) => string;
  }) => (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
        <label htmlFor={id} className="text-sm font-semibold text-app-text">{label}</label>
        <span className="font-extrabold text-primary text-base">{formato(valor)}</span>
      </div>
      {ayuda && <p className="text-xs text-app-muted mb-2 leading-relaxed">{ayuda}</p>}
      <input
        id={id} type="range" min={min} max={max} step={step} value={valor}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-primary h-2 cursor-pointer"
        aria-valuenow={valor} aria-valuemin={min} aria-valuemax={max}
      />
      <div className="flex justify-between text-[10px] text-app-muted mt-1">
        <span>{formato(min)}</span>
        <span>{formato(max)}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-4 sm:space-y-5">

      {/* Estado del motor — toggle */}
      <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap
        ${reglas.activo ? 'bg-green-50 border-accent-green/30' : 'bg-red-50 border-accent-crimson/30'}`}>
        <div className="flex items-center gap-3 min-w-0">
          {reglas.activo
            ? <CheckCircle2 size={22} className="text-accent-green shrink-0" />
            : <AlertTriangle size={22} className="text-accent-crimson shrink-0" />}
          <div className="min-w-0">
            <p className={`font-bold text-sm ${reglas.activo ? 'text-accent-green' : 'text-accent-crimson'}`}>
              Motor {reglas.activo ? 'ACTIVO' : 'INACTIVO'}
            </p>
            <p className="text-xs text-app-muted leading-snug">
              {reglas.activo
                ? 'La conciliación automática está habilitada.'
                : 'Todos los tickets irán a revisión manual.'}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0" aria-label={`Motor ${reglas.activo ? 'activo' : 'inactivo'}`}>
          <input
            type="checkbox" checked={reglas.activo}
            onChange={(e) => setReglas((r) => ({ ...r, activo: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-app-border rounded-full peer
            peer-checked:bg-accent-green
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Parámetros */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-6">
        <h2 className="font-bold text-app-muted text-xs uppercase tracking-wide mb-5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
          Parámetros de conciliación
        </h2>
        <div className="flex flex-col gap-6">
          <Slider
            id="umbral" label="Umbral para reembolso automático"
            ayuda="Montos superiores requerirán aprobación manual."
            min={50} max={500} step={10} valor={reglas.umbralReembolsoAutomatico}
            onChange={(v) => setReglas((r) => ({ ...r, umbralReembolsoAutomatico: v }))}
            formato={(v) => `S/ ${v}`}
          />
          <Slider
            id="timeout" label="Tiempo máximo de espera (timeout)"
            ayuda="Si la pasarela no responde en este tiempo, el caso pasa a revisión manual."
            min={3} max={30} step={1} valor={reglas.timeoutSegundos}
            onChange={(v) => setReglas((r) => ({ ...r, timeoutSegundos: v }))}
            formato={(v) => `${v} seg.`}
          />
          <Slider
            id="probConc" label="Probabilidad de conciliación exitosa"
            ayuda="Porcentaje de tickets que se resolverán emitiendo la entrada + QR."
            min={0.5} max={0.98} step={0.01} valor={reglas.probabilidadConciliacion}
            onChange={(v) => setReglas((r) => ({
              ...r,
              probabilidadConciliacion: v,
              probabilidadReembolso: Math.min(r.probabilidadReembolso, +(1 - v).toFixed(2)),
            }))}
            formato={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <Slider
            id="probReemb" label="Probabilidad de reembolso automático"
            ayuda="Porcentaje de tickets que se resolverán con reembolso directo."
            min={0} max={+(1 - reglas.probabilidadConciliacion).toFixed(2)} step={0.01}
            valor={reglas.probabilidadReembolso}
            onChange={(v) => setReglas((r) => ({ ...r, probabilidadReembolso: v }))}
            formato={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Distribución esperada */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-app-text text-sm mb-4 flex items-center gap-2">
          <Info size={15} className="text-primary-light" aria-hidden="true" />
          Distribución de resultados esperada
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Conciliación (QR emitido)', valor: reglas.probabilidadConciliacion, color: '#30A67D' },
            { label: 'Reembolso automático',      valor: reglas.probabilidadReembolso,    color: '#7E2582' },
            { label: 'Revisión manual',            valor: probManual,                       color: '#DE9430' },
          ].map(({ label, valor, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-app-text">{label}</span>
                <span className="font-bold" style={{ color }}>{(valor * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-app-border rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${valor * 100}%`, backgroundColor: color }}
                  role="progressbar"
                  aria-valuenow={Math.round(valor * 100)}
                  aria-valuemin={0} aria-valuemax={100}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones — full width en móvil, side by side en sm+ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variante="primary" tamano="lg" icono={<Save size={18} />}
          onClick={handleGuardar} cargando={guardando} fullWidth>
          Guardar configuración
        </Button>
        <Button variante="outline" tamano="lg" icono={<RotateCcw size={18} />}
          onClick={handleRestablecer} cargando={restableciendo} fullWidth>
          Restablecer datos demo
        </Button>
      </div>
    </div>
  );
}
