# Cineplanet ServiceDesk

> Mesa de Servicios ITIL 4 para gestionar transacciones fallidas en la venta digital de entradas y combos de Cineplanet (Cineplex S.A., Perú).

---

## Descripción del problema

El cliente paga con tarjeta, el dinero se debita, pero no se emite la entrada digital ni el código QR. El reclamo se atendía manualmente con:

| Indicador | Antes | Meta |
|---|---|---|
| MTTR | 72 horas | < 15 minutos |
| CSAT | 45% | > 85% |
| Conciliación automática | 0% | > 90% |
| Deflexión por autoservicio | 10% | > 40% |

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Vite + React 18 + TypeScript** | Framework y bundler |
| **React Router v6** | Enrutamiento con rutas protegidas por rol |
| **Tailwind CSS v3** | Estilos con paleta Cineplanet en `tailwind.config.js` |
| **Recharts** | 6 gráficos del dashboard ejecutivo |
| **Lucide React** | Iconografía |
| **react-hook-form + Zod** | Formularios con validación en español |
| **Context API + useReducer** | Estado global (Auth, Tickets, Toast) |
| **localStorage** | Persistencia de datos simulados (seed de 40 tickets) |

---

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
http://localhost:5173
```

---

## Usuarios demo

| Correo | Contraseña | Rol | Acceso |
|---|---|---|---|
| `cliente@demo.com` | `123456` | Cliente Final | Portal de autoservicio → `/cliente` |
| `operador@demo.com` | `123456` | Operador Nivel 1 | Bandeja de tickets → `/operador` |
| `admin@demo.com` | `123456` | Administrador L2 | Dashboard ejecutivo → `/admin` |

Los usuarios aparecen como accesos rápidos en la pantalla de login.

---

## Módulos implementados

### Módulo 1 — Portal de Autoservicio (Cliente)
- **Dashboard del cliente** con resumen de tickets activos y resueltos.
- **Formulario de registro de incidencia** con validaciones Zod en español: nombre, DNI (8 dígitos), correo, teléfono (9 dígitos, inicia en 9), sede (34 opciones), película, fecha/hora de la función, monto, últimos 4 dígitos de la tarjeta (tokenización), pasarela, número de operación y descripción.
- **Deflexión de tickets**: mientras el usuario escribe la descripción, el sistema sugiere artículos FAQ relacionados.
- **Seguimiento con stepper visual** mostrando cada cambio de estado con fecha/hora y autor.
- **Encuesta CSAT** de 1 a 5 estrellas con comentario opcional al cerrarse el ticket.
- **Base de conocimiento/FAQ** con buscador en tiempo real, 4 categorías y acordeones accesibles.

### Módulo 2 — Panel de Gestión (Operador L1 / Admin L2)
- **Bandeja de tickets** con filtros por estado, prioridad, pasarela y fechas; búsqueda de texto; paginación.
- **Semáforo de SLA** por ticket (verde / naranja / rojo).
- **Detalle del ticket**: datos del cliente, transacción, resultado de la conciliación, stepper de historial.
- **Acciones del operador**: cambiar estado con comentario (modal de confirmación), agregar notas internas.
- **Log de auditoría** colapsable con toda la trazabilidad (quién hizo qué y cuándo).

### Módulo 3 — Motor de Conciliación Automática
- Al registrar un ticket, pasa automáticamente a *En Validación* y el motor consulta a la pasarela (delay de 3–8 s).
- Resultados ponderados simulados: ~90% conciliación (QR emitido) · ~5% reembolso · ~5% revisión manual.
- **Overlay de animación en vivo** con barra de progreso y mensajes de estado.
- Vista de administración para configurar: umbral de reembolso, timeout, probabilidades.
- Cálculo del MTTR de cada ticket en minutos.

### Módulo 4 — Dashboard Ejecutivo (Admin L2)
- **5 tarjetas KPI** con meta vs. valor actual e indicador de cumplimiento.
- **6 gráficos Recharts** con paleta Cineplanet:
  1. Línea de MTTR por semana
  2. Barras de volumen de tickets por día
  3. Barras horizontales de tickets por estado
  4. Dona de distribución por pasarela (Niubiz / Izipay)
  5. Línea de CSAT mensual
  6. Barras comparativas antes vs. después
- **Barras de cumplimiento de SLA** con colores semáforo.
- **Exportar CSV** con todos los tickets (compatible con Excel, con BOM UTF-8).

---

## Estructura de carpetas

```
src/
├── assets/
├── components/
│   ├── layout/     # Navbar, Sidebar, LogoCineplanet, DecorativeBanner
│   ├── tickets/    # ConciliacionAnimacion, TicketStepper, EncuestaCsat
│   └── ui/         # Button, Badge, Modal, Toast, Spinner, Skeleton, Input, KpiCard, EmptyState
├── context/        # AuthContext, TicketsContext, ToastContext
├── data/           # mockData, peliculas, sedes
├── pages/
│   ├── auth/       # LoginPage
│   ├── cliente/    # Dashboard, NuevoTicket, MisTickets, DetalleTicket, FAQ
│   ├── operador/   # Layout, Bandeja, DetalleTicketOps
│   └── admin/      # Layout, Dashboard, Usuarios, MotorConfig
├── routes/         # AppRouter, RutaProtegida
├── services/       # authService, ticketService, conciliationService, kpiService, faqService, usuarioService, storageService, seedService
├── types/          # index.ts (todas las interfaces)
└── utils/          # delay, format, sla, exportCsv, validators
```

---

## Datos de demostración

El seed se carga automáticamente en `localStorage` la primera vez. Incluye:
- **40 tickets** con estados, prioridades, pasarelas y fechas variados.
- **3 usuarios** demo (cliente, operador, admin).
- **15 artículos FAQ** en 4 categorías.
- **34 sedes** de Cineplanet (Lima y provincias).
- **20 películas** ficticias.

Para restablecer los datos originales, ir a **Admin → Motor de Conciliación → "Restablecer datos demo"**.

---

## Accesibilidad

- Etiquetas `<label>` en todos los campos de formulario.
- Atributos `aria-label`, `aria-expanded`, `aria-current`, `role="alert"`, `aria-live="polite"`.
- Contraste texto/fondo verifica WCAG AA en la paleta Cineplanet.
- Navegación completa por teclado (focus rings visibles).
- Semántica HTML correcta (`<nav>`, `<main>`, `<header>`, `<table>`, `<ol>`).

---

## Preparación para backend real

La capa `src/services/` expone funciones `async` con delays artificiales. Para conectar a un backend real:

1. Reemplazar el cuerpo de cada función en `services/` por llamadas `fetch`/`axios` a la API correspondiente.
2. Eliminar la dependencia de `storageService.ts` para las operaciones de escritura.
3. Mantener las mismas firmas de función — el resto del frontend no requiere cambios.

---

## Licencia

Proyecto de demostración — Cineplex S.A. / Cineplanet. Solo uso educativo e interno.
