// ============================================================
// FAQ — responsive, buscador, categorías, acordeones
// ============================================================
import { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, ThumbsUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listarFaqs, buscarFaqs } from '../../services/faqService';
import type { ArticuloFAQ, CategoriaFAQ } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const CATEGORIAS: { valor: CategoriaFAQ | ''; label: string; color: string }[] = [
  { valor: '',            label: 'Todas',          color: 'bg-primary/10 text-primary border-primary/20' },
  { valor: 'Pagos',       label: '💳 Pagos',        color: 'bg-blue-100 text-primary border-primary/20' },
  { valor: 'Entradas/QR', label: '🎫 Entradas/QR',  color: 'bg-teal-100 text-accent-teal border-accent-teal/30' },
  { valor: 'Reembolsos',  label: '💰 Reembolsos',   color: 'bg-purple-100 text-accent-purple border-accent-purple/30' },
  { valor: 'Combos',      label: '🍿 Combos',        color: 'bg-orange-100 text-accent-orange border-accent-orange/30' },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<ArticuloFAQ[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<CategoriaFAQ | ''>('');
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    listarFaqs()
      .then((data) => setFaqs(data.filter((f) => f.titulo)))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const r = await buscarFaqs(busqueda, categoria || undefined);
      setFaqs(r.filter((f) => f.titulo));
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda, categoria]);

  const toggle = (id: string) =>
    setAbiertos((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const agrupados: Partial<Record<CategoriaFAQ, ArticuloFAQ[]>> = faqs.reduce(
    (acc, f) => { (acc[f.categoria] ??= []).push(f); return acc; },
    {} as Partial<Record<CategoriaFAQ, ArticuloFAQ[]>>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Cabecera */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <HelpCircle size={28} className="text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-app-text mb-2">Centro de Ayuda</h1>
        <p className="text-app-muted text-sm leading-relaxed max-w-sm mx-auto">
          Encuentra respuestas rápidas sobre pagos, entradas y reembolsos.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar: 'cobro no reflejado', 'QR', 'reembolso'..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm border-2 border-app-border rounded-2xl
            focus:outline-none focus:border-primary shadow-sm bg-white min-h-[44px]"
          aria-label="Buscar preguntas frecuentes"
        />
      </div>

      {/* Categorías — scroll horizontal en móvil */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CATEGORIAS.map(({ valor, label, color }) => (
          <button
            key={valor}
            onClick={() => setCategoria(valor)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap min-h-[36px] shrink-0
              ${categoria === valor
                ? `${color} shadow-sm`
                : 'bg-white border-app-border text-app-muted hover:border-primary/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-app-border shadow-sm p-6">
          <p className="text-app-muted text-sm mb-4">
            No encontramos resultados{busqueda ? ` para "<strong>${busqueda}</strong>"` : ''}.
          </p>
          <Link to="/cliente/nuevo-ticket">
            <Button variante="cta" icono={<ArrowRight size={15} />}>Registrar un reclamo</Button>
          </Link>
        </div>
      ) : categoria === '' ? (
        // Vista agrupada
        Object.entries(agrupados).map(([cat, items]) => (
          <div key={cat} className="mb-5 sm:mb-6">
            <h2 className="text-xs font-bold text-app-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {cat}
            </h2>
            <div className="flex flex-col gap-2">
              {items!.map((faq) => (
                <FaqItem key={faq.id} faq={faq} abierto={abiertos.has(faq.id)} onToggle={() => toggle(faq.id)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col gap-2">
          {faqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} abierto={abiertos.has(faq.id)} onToggle={() => toggle(faq.id)} />
          ))}
        </div>
      )}

      {/* CTA final */}
      <div className="mt-8 bg-primary-dark rounded-2xl p-5 sm:p-6 text-center">
        <p className="text-white font-bold mb-1 text-sm sm:text-base">¿No encontraste la respuesta?</p>
        <p className="text-white/70 text-xs sm:text-sm mb-4 leading-relaxed">
          Registra tu reclamo y un especialista te ayudará en menos de 15 minutos.
        </p>
        <Link to="/cliente/nuevo-ticket">
          <Button variante="cta">Reportar cobro no reflejado</Button>
        </Link>
      </div>
    </div>
  );
}

function FaqItem({ faq, abierto, onToggle }: { faq: ArticuloFAQ; abierto: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${abierto ? 'border-primary-light/40' : 'border-app-border'}`}>
      <button
        onClick={onToggle}
        aria-expanded={abierto}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start sm:items-center justify-between gap-3 min-h-[52px]"
      >
        <span className="text-sm font-semibold text-app-text leading-snug">{faq.titulo}</span>
        {abierto
          ? <ChevronUp size={16} className="text-primary-light shrink-0 mt-0.5 sm:mt-0" />
          : <ChevronDown size={16} className="text-app-muted shrink-0 mt-0.5 sm:mt-0" />}
      </button>
      {abierto && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <p className="text-sm text-app-muted leading-relaxed mb-3">{faq.contenido}</p>
          <div className="flex flex-wrap items-center gap-2">
            {faq.tags.map((tag) => (
              <span key={tag} className="text-xs bg-app-bg px-2 py-0.5 rounded-lg text-app-muted">
                #{tag}
              </span>
            ))}
            <div className="ml-auto flex items-center gap-1 text-xs text-app-muted">
              <ThumbsUp size={12} aria-hidden="true" />
              <span>{faq.util} útil{faq.util !== 1 ? 'es' : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
