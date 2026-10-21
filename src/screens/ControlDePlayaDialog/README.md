# ControlDePlayaDialog

## 1. Purpose
`ControlDePlayaDialog` handles the inspection and verification of vehicle stock and mileage at both the start of the shift (`salida`) and end of the shift (`entrada`). It records odometer readings (`kilometros`), counts for loaded, empty, and defective items (`cantidad`, `cantidadVacia`, `cantidadFallada`), and supports physical supervisor validation / two-factor supervisor sign-off (`aprobarControlPlaya`).

## 2. File Structure
```
ControlDePlayaDialog/
├── index.tsx     # Flow tabs, odometer inputs, line editing, supervisor approval modal
├── types.ts     # Props, tab definitions, line item structures, flow types
├── styles.ts    # Extracted StyleSheet definitions, cards, diff indicators
├── utils.ts     # Tab configurations, item mapping, km difference calculations, payload builders
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `ControlDePlayaDialogProps`:
  - `visible: boolean`: Dialog visibility flag.
  - `onClose: () => void`: Dismiss handler.
  - `deliveryDate: string`: Active ISO delivery date (YYYY-MM-DD).
- `FlowType`: `'salida' | 'entrada'`.
- `TabKey`: `'articulos' | 'dispensers' | 'repuestos'`.
- `LineaEditable`: Working state for individual loaded product rows.
- `FeedbackState`: Status message configuration.

## 4. Extracted Business Logic & Utils
- **Tabs (`TABS`)**: Category tabs with dynamic count badges for loaded lines.
- **Data Preloading & Mapping**:
  - `mapControlPlayaLineasToEditable`: Converts incoming Odoo `ControlPlayaLinea[]` into editable string state.
  - `mapSalidaToEntradaEditable`: Automatically copies salida items into entrada view with zeroed empties/defects for faster closing counts.
- **Odometer Computation (`calculateKmDiff`)**: Computes trip distance (`diff = kmEntrada - kmSalida`) and flags negative mileage anomalies.
- **Salida Read-Only Lock (`isSalidaBloqueada`)**: When the Salida count is confirmed/approved (`controlSalida.aprobado === true` or `state === 'confirmado'`), all departure fields (kilometers, loaded quantities) are rendered as read-only (`editable={false}`), and item addition/removal and save buttons are disabled.
- **Payload Construction (`buildSaveControlPlayaPayload`)**: Converts form state to numeric offline queue payload.

## 5. Styles
- Dedicated card styling for approved states (green badge) and pending supervisor approval states.
- Outflow reference cards in `entrada` mode indicating the initial items loaded.
- Product row cards with input clusters for full, empty, and damaged units.

## 6. Odoo / Offline Sync Integration
- **Persisted Offline Saves**: Writes through `queuedWrites.saveControlPlaya` so truck departure or arrival counts can be recorded in zero-connectivity environments.
- **Supervisor Sign-off**: Calls `repartoApiClient.aprobarControlPlaya` requiring supervisor credentials when finalizing.
- Invalidates `['reparto', 'control-playa']`, `['reparto', 'stock-en-ruta']`, and `['reparto', 'hoja-de-ruta']` to keep route data in sync across the application.
