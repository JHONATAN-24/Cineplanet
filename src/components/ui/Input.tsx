// Campos de formulario accesibles con etiqueta y mensaje de error
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface CampoBase {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
}

// ── Input de texto ────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement>, CampoBase {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ etiqueta, error, ayuda, requerido, id, className = '', ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        <label htmlFor={inputId} className="block text-sm font-semibold text-app-text mb-1.5">
          {etiqueta}
          {requerido && <span className="text-accent-crimson ml-1" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : ayuda ? `${inputId}-ayuda` : undefined}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm text-app-text placeholder:text-app-muted/60 bg-white transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/30
            ${error ? 'border-accent-crimson' : 'border-app-border focus:border-primary'}`}
          {...props}
        />
        {ayuda && !error && (
          <p id={`${inputId}-ayuda`} className="text-xs text-app-muted mt-1">{ayuda}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-accent-crimson mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Select ───────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, CampoBase {
  opciones: { valor: string; texto: string }[] | string[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ etiqueta, error, ayuda, requerido, id, className = '', opciones, placeholder, ...props }, ref) => {
    const selId = id ?? props.name;
    return (
      <div className={`w-full ${className}`}>
        <label htmlFor={selId} className="block text-sm font-semibold text-app-text mb-1.5">
          {etiqueta}
          {requerido && <span className="text-accent-crimson ml-1" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={selId}
          aria-invalid={!!error}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm text-app-text bg-white transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/30
            ${error ? 'border-accent-crimson' : 'border-app-border focus:border-primary'}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opciones.map((o) => {
            const valor = typeof o === 'string' ? o : o.valor;
            const texto = typeof o === 'string' ? o : o.texto;
            return (
              <option key={valor} value={valor}>
                {texto}
              </option>
            );
          })}
        </select>
        {ayuda && !error && <p className="text-xs text-app-muted mt-1">{ayuda}</p>}
        {error && (
          <p role="alert" className="text-xs text-accent-crimson mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, CampoBase {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ etiqueta, error, ayuda, requerido, id, className = '', ...props }, ref) => {
    const taId = id ?? props.name;
    return (
      <div className="w-full">
        <label htmlFor={taId} className="block text-sm font-semibold text-app-text mb-1.5">
          {etiqueta}
          {requerido && <span className="text-accent-crimson ml-1" aria-hidden="true">*</span>}
        </label>
        <textarea
          ref={ref}
          id={taId}
          aria-invalid={!!error}
          className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm text-app-text placeholder:text-app-muted/60 bg-white transition-colors resize-none
            focus:outline-none focus:ring-2 focus:ring-primary/30
            ${error ? 'border-accent-crimson' : 'border-app-border focus:border-primary'}`}
          {...props}
        />
        {ayuda && !error && <p className="text-xs text-app-muted mt-1">{ayuda}</p>}
        {error && (
          <p role="alert" className="text-xs text-accent-crimson mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
