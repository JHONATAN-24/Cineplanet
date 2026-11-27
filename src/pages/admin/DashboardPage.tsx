// ============================================================
// Dashboard Ejecutivo — responsive mobile-first
// KPIs: 1 col móvil, 2 tablet, 3-5 escritorio
// Gráficos: ResponsiveContainer, alturas adaptables
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Clock, Wifi, Star, Zap, TrendingUp, Download, RefreshCw } from 'lucide-react';
import {
  obtenerKpis, seriesMttrSemanal, distribucionEstados,
  distribucionPasarela, seriesCsatMensual, volumenTicketsDiario,
  obtenerComparativo, type ComparativoKpi,
} from '../../services/kpiService';
import { listarTickets } from '../../services/ticketService';
import { exportarTicketsCSV } from '../../utils/exportCsv';
import { useToast } from '../../context/ToastContext';
import { formatearDuracion } from '../../utils/format';
import Button from '../../components/ui/Button';
import KpiCard from '../../components/ui/KpiCard';
import type { KpiData, DataPoint } from '../../types';

// Paleta de colores Cineplanet para Recharts
const C = {
  primary: '#204D8A', yellow: '#FAE93F', green: '#30A67D',
  teal: '#15A9B8',  orange: '#DE9430', magenta: '#B5127F',
  purple: '#7E2582', crimson: '#CB2054',
};

// Tooltip personalizado compartido
const TooltipCP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-app-border rounded-xl shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-bold text-app-text mb-1 truncate">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold truncate">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// Tarjeta de gráfico
function ChartCard({ titulo, subtitulo, children }: {
  titulo: string; subtitulo: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
      <div className="mb-3 sm:mb-4">
        <h2 className="font-bold text-app-text text-sm">{titulo}</h2>
        <p className="text-xs text-app-muted">{subtitulo}</p>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { mostrar } = useToast();
  const [kpis, setKpis]             = useState<KpiData | null>(null);
  const [mttrSerie, setMttrSerie]   = useState<DataPoint[]>([]);
  const [estadosDist, setEstadosDist] = useState<{ estado: string; cantidad: number; color: string }[]>([]);
  const [pasarelaDist, setPasarelaDist] = useState<{ pasarela: string; value: number; color: string }[]>([]);
  const [csatSerie, setCsatSerie]   = useState<DataPoint[]>([]);
  const [volumen, setVolumen]       = useState<DataPoint[]>([]);
  const [comparativo, setComparativo] = useState<ComparativoKpi[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [k, mttr, estados, pasarela, csat, vol, comp] = await Promise.all([
        obtenerKpis(), seriesMttrSemanal(), distribucionEstados(),
        distribucionPasarela(), seriesCsatMensual(), volumenTicketsDiario(),
        obtenerComparativo(),
      ]);
      setKpis(k); setMttrSerie(mttr); setEstadosDist(estados);
      setPasarelaDist(pasarela); setCsatSerie(csat); setVolumen(vol);
      setComparativo(comp);
    } catch { mostrar('Error al cargar los datos del dashboard.', 'error'); }
    finally { setCargando(false); }
  }, [mostrar]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleExportar = async () => {
    setExportando(true);
    try {
      const tickets = await listarTickets();
      exportarTicketsCSV(tickets);
      mostrar('Reporte CSV exportado.', 'exito');
    } catch { mostrar('Error al exportar.', 'error'); }
    finally { setExportando(false); }
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-5">

      {/* Encabezado */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <p className="text-app-muted text-sm">KPIs, SLA e indicadores en tiempo real</p>
        <div className="flex gap-2 flex-wrap">
          <Button variante="secondary" tamano="sm" icono={<RefreshCw size={15} />} onClick={cargar} cargando={cargando}>
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <Button variante="primary" tamano="sm" icono={<Download size={15} />} onClick={handleExportar} cargando={exportando}>
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 5 KPI Cards ──────────────────────────────────────
          1 col en móvil, 2 en sm, 3 en md, 5 en xl          */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard
          titulo="MTTR" cargando={cargando}
          valor={kpis ? formatearDuracion(kpis.mttrPromedio) : '—'}
          meta="< 15 min" metaValor={15} actualValor={kpis?.mttrPromedio}
          mejorCuandoMenor icono={<Clock size={18} />}
        />
        <KpiCard
          titulo="Disponibilidad" cargando={cargando}
          valor={kpis ? `${kpis.disponibilidad}%` : '—'}
          meta="≥ 99.9%" metaValor={99.9} actualValor={kpis?.disponibilidad}
          icono={<Wifi size={18} />}
        />
        <KpiCard
          titulo="CSAT" cargando={cargando}
          valor={kpis ? `${kpis.csat.toFixed(1)}%` : '—'}
          meta="> 85%" metaValor={85} actualValor={kpis?.csat}
          icono={<Star size={18} />}
        />
        <KpiCard
          titulo="Conciliación Auto." cargando={cargando}
          valor={kpis ? `${kpis.conciliacionAutomatica.toFixed(1)}%` : '—'}
          meta="> 90%" metaValor={90} actualValor={kpis?.conciliacionAutomatica}
          icono={<Zap size={18} />}
        />
        <KpiCard
          titulo="Deflexión" cargando={cargando}
          valor={kpis ? `${kpis.deflexionAutoservicio}%` : '—'}
          meta="> 40%" metaValor={40} actualValor={kpis?.deflexionAutoservicio}
          icono={<TrendingUp size={18} />}
        />
      </div>

      {/* ── Fila 1: MTTR semanal + Volumen diario ───────────
          1 col móvil, 2 cols lg+                             */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <ChartCard titulo="MTTR por semana (min)" subtitulo="Tendencia de tiempo de resolución">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mttrSerie} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: '#5B6B85' }} />
              <YAxis tick={{ fontSize: 10, fill: '#5B6B85' }} unit=" m" width={40} />
              <Tooltip content={<TooltipCP />} />
              <Line type="monotone" dataKey="valor" name="MTTR (min)"
                stroke={C.primary} strokeWidth={2.5}
                dot={{ fill: C.primary, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone"
                data={mttrSerie.map((d) => ({ ...d, meta: 15 }))}
                dataKey="meta" name="Meta (15 min)"
                stroke={C.green} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Volumen de tickets por día" subtitulo="Últimos 14 días">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumen} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 9, fill: '#5B6B85' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#5B6B85' }} allowDecimals={false} width={30} />
              <Tooltip content={<TooltipCP />} />
              <Bar dataKey="valor" name="Tickets" fill={C.primary} radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Fila 2: Estados + Pasarela ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <ChartCard titulo="Tickets por estado" subtitulo="Distribución actual">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={estadosDist} layout="vertical" margin={{ top: 0, right: 10, left: 70, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6B85' }} allowDecimals={false} />
              <YAxis type="category" dataKey="estado" tick={{ fontSize: 10, fill: '#5B6B85' }} width={68} />
              <Tooltip content={<TooltipCP />} />
              <Bar dataKey="cantidad" name="Tickets" radius={[0, 5, 5, 0]} maxBarSize={22}>
                {estadosDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Distribución por pasarela" subtitulo="Niubiz vs Izipay">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pasarelaDist} cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value" nameKey="pasarela"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pasarelaDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'Tickets']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Fila 3: CSAT mensual + Comparativo ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <ChartCard titulo="CSAT mensual (%)" subtitulo="Satisfacción últimos 6 meses">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={csatSerie} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: '#5B6B85' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#5B6B85' }} unit="%" width={38} />
              <Tooltip content={<TooltipCP />} />
              <Line type="monotone" dataKey="valor" name="CSAT (%)"
                stroke={C.green} strokeWidth={2.5}
                dot={{ fill: C.green, r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone"
                data={csatSerie.map((d) => ({ ...d, meta: 85 }))}
                dataKey="meta" name="Meta (85%)"
                stroke={C.yellow} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Antes vs. Después" subtitulo="Impacto del ServiceDesk">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparativo} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 9, fill: '#5B6B85' }}
                interval={0}
                // Abreviar etiquetas largas en pantallas pequeñas via CSS overflow hidden
              />
              <YAxis tick={{ fontSize: 10, fill: '#5B6B85' }} width={35} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = comparativo.find((c) => c.nombre === label);
                  return (
                    <div className="bg-white border border-app-border rounded-xl shadow-lg p-3 text-xs max-w-[180px]">
                      <p className="font-bold text-app-text mb-1 truncate">{label}</p>
                      {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color }} className="font-semibold">
                          {p.name}: {p.value.toFixed(1)}{item?.unidad ?? ''}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="antes"   name="Antes"   fill={C.crimson} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="despues" name="Después" fill={C.green}   radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="meta"    name="Meta"    fill={C.yellow}  radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Barras de cumplimiento SLA ────────────────────── */}
      {kpis && (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
          <h2 className="font-bold text-app-text text-sm mb-5">Cumplimiento de SLA</h2>
          <div className="flex flex-col gap-4">
            {[
              { nombre: 'MTTR (↓ mejor)', actual: kpis.mttrPromedio, meta: 15, unidad: ' min', inv: true },
              { nombre: 'CSAT', actual: kpis.csat, meta: 85, unidad: '%', inv: false },
              { nombre: 'Conciliación automática', actual: kpis.conciliacionAutomatica, meta: 90, unidad: '%', inv: false },
              { nombre: 'Deflexión autoservicio', actual: kpis.deflexionAutoservicio, meta: 40, unidad: '%', inv: false },
              { nombre: 'Disponibilidad', actual: kpis.disponibilidad, meta: 99.9, unidad: '%', inv: false },
            ].map(({ nombre, actual, meta, unidad, inv }) => {
              const cumple = inv ? actual <= meta : actual >= meta;
              const pct = inv
                ? Math.min(100, (1 - Math.max(0, actual - meta) / meta) * 100)
                : Math.min(100, (actual / meta) * 100);
              const color = cumple ? '#30A67D' : pct > 60 ? '#DE9430' : '#CB2054';
              return (
                <div key={nombre}>
                  <div className="flex flex-wrap justify-between text-xs mb-1.5 gap-1">
                    <span className="font-semibold text-app-text">{nombre}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-app-muted">Meta: <strong>{meta}{unidad}</strong></span>
                      <span className="font-bold" style={{ color }}>Actual: {actual.toFixed(1)}{unidad}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                        ${cumple ? 'bg-green-100 text-accent-green' : 'bg-orange-100 text-accent-orange'}`}>
                        {cumple ? '✓ Cumple' : '⟳ Progreso'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-app-border rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(2, pct)}%`, backgroundColor: color }}
                      role="progressbar"
                      aria-valuenow={Math.round(pct)}
                      aria-valuemin={0} aria-valuemax={100}
                      aria-label={nombre}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
