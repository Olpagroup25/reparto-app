# ActivarClientePropioDialog

## 1. Purpose
`ActivarClientePropioDialog` handles the workflow of activating an individual consumer (`res.partner` person) as a direct delivery customer ("Cliente por derecho propio" — Caso 3 / `insa_autorizacion_pedido`). It captures the dedicated home address (`insa.city`, `insa.street`, house number, floor, apt, and delivery notes) and creates their dedicated `fsm.location` in Odoo.sh in real-time.

## 2. File Structure
```
ActivarClientePropioDialog/
├── index.tsx     # Dialog container, multi-step picker views, and submit flow
├── types.ts     # Dialog props, feedback state, and picker view mode types
├── styles.ts    # Extracted StyleSheet definitions and design tokens
├── utils.ts     # Address validation, search filtering, and payload builder helpers
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `ActivarClientePropioDialogProps`:
  - `visible: boolean`: Dialog visibility flag.
  - `onClose: () => void`: Handler to dismiss the modal.
  - `deliveryDate?: string`: Active ISO delivery date (YYYY-MM-DD).
  - `cliente: ClienteBusqueda | ClienteVisita | null`: Selected contact target to activate.
  - `onActivated: (cliente: ClienteBusqueda) => void`: Callback triggered upon successful Odoo activation.
- `PickerFor`: Sub-view switcher (`'ciudad' | 'calle' | null`).
- `FeedbackState`: Status message configuration for the `FeedbackDialog`.

## 4. Extracted Business Logic & Utils
- **Catalog Filtering (`filterCatalogOptions`)**: Case-insensitive substring filtering for cities and dependent streets.
- **Form Validation (`canActivarCliente`)**: Ensures a target client, city, street, and house number are populated before enabling submission.
- **Payload Construction (`buildActivarClientePayload`)**: Trims and packages address parameters, converting blank optional strings to `undefined`.

## 5. Styles
- Modal styling using design tokens (`colors`, `spacing`, `typography`).
- Responsive row layout for street number, floor, and apartment unit inputs.
- Dedicated header and list containers for inline picker views with search bars.

## 6. Odoo / Offline Sync Integration
- Fetches cached city and street catalogs using `useCiudades()` and `useCalles(cityId)`.
- Calls `repartoApiClient.activarClientePropio` to execute the activation against the Odoo REST endpoint.
- Invalidates the `['reparto']` query key in React Query to refresh any dependent client listings.
