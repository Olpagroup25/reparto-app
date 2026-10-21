# RegistrarVisitaDialog

## Purpose
`RegistrarVisitaDialog` registers customer visits (`POST /insa/api/visita`), supporting two mutually exclusive modes as defined by the Odoo `insa.movimiento.cliente` model:
1. **Sin transacción**: Captures outcomes when no merchandise or payment changes hands (`ausente`, `sin_gestion`, including WhatsApp-remote handling).
2. **Con transacción**: Records sales, bottle returns/loans (`lineasArticulo`, `lineasEnvase`), payments (Cash / Bank transfer with reference number), validating truck stock availability against the approved departure checklist (Control de Playa - Salida).

## File Structure
- `index.tsx`: Core dialog orchestrator with mode toggles, article/bottle lists, product selection swap view, validation, optimistic updates, and feedback dialogs.
- `types.ts`: Prop interfaces (`RegistrarVisitaDialogProps`), editable line items (`LineaArticuloEditable`, `LineaEnvaseEditable`), payment modes, and feedback state.
- `styles.ts`: Presentation styling for mode chips, line cards, validation warnings, segmented buttons, and product picker.
- `utils.ts`: Stock map calculations, price formatters, subtotal and sale calculators, stock limit validators, and product search filter.
- `README.md`: Technical documentation.

## Types & Props
- `RegistrarVisitaDialogProps`:
  - `visible: boolean`: Dialog visibility flag.
  - `onClose: () => void`: Dismiss dialog callback.
  - `deliveryDate: string`: ISO date (`YYYY-MM-DD`) of the current route.
  - `cliente: ClienteVisita | null`: Target customer data.
  - `onSaved: (cliente: ClienteVisita) => void`: Callback triggered with optimistic / refreshed client data upon save.

## Extracted Business Logic & Utils
- `formatPrecio(val)`: Formats numeric / string price into Argentine currency format.
- `calcularTotalVentaArticulos(lineas)`: Computes subtotal of all active sale lines (`tipo === 'venta'`).
- `calcularStockDisponible(stockEnRuta, cliente)`: Derives truck stock availability per product, re-incorporating previously assigned units if editing an existing visit.
- `hayLineasExcedidas(modo, lineas, stockMap)`: Validates that no sale lines exceed available truck stock or have invalid quantities.
- `buscarLineaExcedida(lineas, stockMap)`: Identifies specific violating article lines for tailored error prompts.
- `filtrarProductosPicker(productos, query)`: Search filtering for the embedded product picker.

## Styles
- Mode selector chips (Sin transacción vs Con transacción).
- Highlighted error borders and warning banners when items exceed available stock or when departure checklist is pending approval.
- Segmented payment selector for Cash vs Transfer with conditional transaction reference input.

## Odoo / Offline Sync Integration
- Integrates with `queuedWrites.registrarVisita(...)`:
  - Network-first: writes directly to `POST /insa/api/visita` when connected.
  - Offline-resilient: writes to SQLite outbox queue when disconnected.
- Updates global React Query cache (`['reparto']`) so that `HojaDeRutaScreen`, `StockEnRutaDialog`, and `ControlDePlayaDialog` immediately reflect updated truck balances and customer statuses.
