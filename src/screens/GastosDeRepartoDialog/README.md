# GastosDeRepartoDialog

## 1. Purpose
`GastosDeRepartoDialog` provides delivery drivers with an in-route expense declaration modal. Drivers can declare operational costs incurred during the delivery shift (such as fuel, tolls, meals, parking, and maintenance), inspect existing expenditures, and calculate shift expense totals.

## 2. File Structure
```
GastosDeRepartoDialog/
├── index.tsx     # Multi-view dialog (list, declaration form, type picker)
├── types.ts     # Dialog props and view mode union types
├── styles.ts    # Extracted StyleSheet definitions, layout, and FAB positioning
├── utils.ts     # Fallback expense types, totals calculation, filter & optimistic factory
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `GastosDeRepartoDialogProps`:
  - `visible: boolean`: Dialog visibility flag.
  - `onClose: () => void`: Dismiss handler.
  - `deliveryDate: string`: Current shift ISO date (YYYY-MM-DD).
- `VistaGasto`: `'list' | 'form' | 'tipoPicker'`.

## 4. Extracted Business Logic & Utils
- **Fallback Category Catalog (`TIPOS_FALLBACK`)**: Provides standard categories (`combustible`, `peaje`, `comida`, `estacionamiento`, `mantenimiento`, `otro`) when dynamic Odoo categories are unavailable.
- **Totals Calculation (`calculateTotalGastos`)**: Aggregates sum total across optimistic and server-confirmed expenses.
- **Optimistic State Generator (`buildOptimisticGasto`)**: Creates immediate local representation with negative timestamp IDs (`id: -Date.now()`) tagged as `pendiente`.
- **Form Validator (`canSaveGasto`)**: Enforces non-null category and positive expense amount.

## 5. Styles
- Unified header styling with theme primary color.
- Bordered list items showing category, optional description, and formatted currency amounts (`$xx.xx`).
- Floating Action Button (`fab`) positioned at bottom-right for adding new expenses.

## 6. Odoo / Offline Sync Integration
- **Persisted Offline Queueing (`queuedWrites.crearGastoReparto`)**: Expenses declared in offline zones are stored in the local write queue, reflected in the sync tab, and automatically replayed to Odoo once connection is established.
- Queries server state using `useGastosDeReparto(deliveryDate)` and `useTiposGasto()`.
