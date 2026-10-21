# StockEnRutaDialog

## Purpose
`StockEnRutaDialog` displays a real-time, per-product read-only breakdown of the inventory currently carried on the delivery truck (disponibles, vacíos, fallados, total de envases).

## File Structure
- `index.tsx`: Core dialog component and `ProductoStockCard` rendering product details.
- `types.ts`: Prop interfaces (`StockEnRutaDialogProps`, `ProductoStockCardProps`) and field metadata types (`StockCampo`).
- `styles.ts`: Presentation styling for product cards, dot indicators, dotted leader lines, and thumbnail images.
- `utils.ts`: Field definitions (`STOCK_CAMPOS`) specifying field labels and indicator colors.
- `README.md`: Technical documentation.

## Types & Props
- `StockEnRutaDialogProps`:
  - `visible: boolean`: Dialog visibility flag.
  - `onClose: () => void`: Close callback.
  - `deliveryDate: string`: Delivery dayroute ISO date (`YYYY-MM-DD`).

## Extracted Business Logic & Utils
- `STOCK_CAMPOS`: Configuration constant mapping product stock attributes (`disponibles`, `vacios`, `fallados`, `totalEnvases`) to display labels and theme colors.

## Styles
- Dark navy dialog header matching `ControlDePlayaDialog`.
- Card per product with dot badges and dotted leader rows to visually align numbers.
- Responsive thumbnail image display with graceful fallback when omitted.

## Odoo / Offline Sync Integration
- Integrates with `useStockEnRuta(deliveryDate)` hook (`GET /insa/api/stock-en-ruta`).
- Reflects movements recorded after Control de Playa (Salida) and visit sales/returns in real-time.
