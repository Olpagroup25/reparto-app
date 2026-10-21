# AltaClienteDialog

## 1. Purpose
`AltaClienteDialog` provides the on-route customer registration workflow ("+ Dar de alta un cliente nuevo" — Step 2.7 in delivery route search). Unlike public forms, this component is restricted to authenticated delivery drivers, automatically flagging `customer_rank=1` in Odoo upon sync (`POST /insa/api/clientes`). It supports real-time duplicate search, person/company categorization, address selection (`insa.city` and `insa.street`), contact details, and delivery periodicity settings.

## 2. File Structure
```
AltaClienteDialog/
├── index.tsx     # Form orchestration, debounce search, and submission
├── types.ts     # Props, form state, picker modes, and frequency option interfaces
├── styles.ts    # Extracted StyleSheet definitions, badge chips, and layout
├── utils.ts     # Frequency constants, day chips, catalog filter, and payload builder
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `AltaClienteDialogProps`:
  - `visible: boolean`: Visibility controller.
  - `onClose: () => void`: Close handler.
  - `deliveryDate?: string`: Context date of the current route.
  - `onCreated: (cliente: ClienteBusqueda) => void`: Callback triggered after local queueing or server creation.
- `PickerFor`: Inline modal mode (`'ciudad' | 'calle' | null`).
- `FeedbackState`: Status dialog configuration.
- `FrecuenciaOption`: Mapping for delivery intervals (`semanal`, `quincenal`, `mensual`, `a_demanda`).

- **Constants (`FRECUENCIAS`, `DIAS_SEMANA`)**: Frequency options and days-of-week array (`Lu`, `Ma`, `Mi`, `Ju`, `Vi`, `Sa`).
- **Live Debounced Duplicate Check**:
  - Name Search: 300ms debounce querying `repartoApiClient.buscarClientes(name)` to warn of similar contacts.
  - Multi-Strategy Document Uniqueness Check (`cuitDni` / `vat`): 300ms debounce and synchronous pre-submit guard calling `repartoApiClient.verificarDocumentoExistente(doc)` (checking exact VAT, sanitized digits, and formatted strings against Odoo). If found, it renders a blocking error card, disables the "Crear" action button, and blocks both direct submissions and offline queueing (`queuedWrites.crearCliente`).
- **Validation (`canSaveAltaCliente`)**: Requires non-empty name, selected city, selected street, street number, and `!documentoDuplicado`.
- **Offline Payload Builder (`buildCrearClientePayload`)**: Converts form state to offline queue write parameters.

## 5. Styles
- Segmented tab switch for Persona vs Empresa with icons.
- Warning card for potential matching customers (`coincidenciasContainer`).
- Custom rounded chips for delivery frequencies and multi-select day buttons (`dayChip`, `dayChipActive`).

## 6. Odoo / Offline Sync Integration
- **Offline-First via `queuedWrites.crearCliente`**: Assigns a temporary negative `tempPartnerId` if offline, allowing subsequent operations (such as registering visits, sales, or debt collections) to proceed seamlessly. The sync worker resolves temp IDs to permanent Odoo database IDs once connectivity resumes.
