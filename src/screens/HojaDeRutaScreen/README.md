# HojaDeRutaScreen

## Purpose
`HojaDeRutaScreen` is the central driver hub of the mobile application. It loads and manages today's delivery sheet (Hoja de Ruta), presenting customers, debts, consumption balances, map shortcuts, visit logging, local sorting/reordering, search across the entire customer base, and sub-tabs for Pending, Repasos (re-visits), Technical Service (dispenser repairs), and Sync status.

## File Structure
- `index.tsx`: Main screen container orchestrating bottom navigation tabs, navigation drawer, modal dialogs, and local additions/removals.
- `components/`: Internal tab and card subcomponents (`TodosTab`, `PendientesTab`, `RepasoTab`, `SrvTecTab`, `ClientCard`, `ResultRow`, `ListModeToggle`).
- `types.ts`: Prop interfaces (`HojaDeRutaScreenProps`, tab props, card props, result row props) and navigation types (`TabKey`, `ClientCardVariant`).
- `styles.ts`: Presentation styling for app bar, cards, paired boxes (FUE / FUC), stat blocks, action buttons, search results, and floating buttons.
- `utils.ts`: Data transformation helpers (`clienteBusquedaAVisita`, `combineClientes`), debt and overdue checkers (`isOverdue`, `isPriority`, `sinMovimiento`), text search normalizer (`normalizarTexto`), date/currency formatters (`formatFecha`, `money`), geolocation launcher (`abrirEnMapa`), and drawer configurations (`DRAWER_ITEMS`).
- `README.md`: Technical documentation.

## Types & Props
- `HojaDeRutaScreenProps`: NativeStackScreenProps for route `'HojaDeRuta'` in `RootStackParamList`. Requires `route.params.deliveryDate: string` (`YYYY-MM-DD`).
- `TabKey`: Active navigation tab: `'todos' | 'pendientes' | 'repaso' | 'srv_tec' | 'sync'`.
- `ClientCardVariant`: Visual card styling mode (`'todos'` with paired boxes or `'pendientes'` with stat rows).

## Extracted Business Logic & Utils
- `clienteBusquedaAVisita(c, enRuta)`: Converts a customer search record (`ClienteBusqueda`) to a route-compatible `ClienteVisita` model with neutral defaults.
- `combineClientes(clientesRaw, localAddedClients)`: Deduplicates and merges backend dayroute customers with locally added customers.
- `normalizarTexto(input)`: Case and accent-folding string normalizer ensuring accent-insensitive local search.
- `isPriority(client)` / `isOverdue(client)`: Derives visual alert states from the customer balance `saldoFacturas`.
- `sinMovimiento(c)`: Strict check determining if a customer is truly untouched in today's run.
- `abrirEnMapa(direccion)`: Deep links to native mapping apps (Google Maps / Apple Maps / Android `geo:` intent).

## Styles
- Clean Material 3 style cards with accent borders reflecting overdue debts, priority status, or visit state.
- List mode switcher (`Interactiva` vs `Solo lectura`) allowing safe device hand-offs without accidental clicks.
- Bottom navigation bar with dynamic pending, repaso, and sync counter badges.

## Odoo / Offline Sync Integration
- Integrates with:
  - `useHojaDeRuta(deliveryDate)`: fetches and caches dayroute (`GET /insa/api/hoja-de-ruta`).
  - `useClientMarks(routeId, deliveryDate)`: local SQLite marks for repasos and dispenser technical service.
  - `clientOrder.ts`: local driver custom stop ordering persisted across app restarts and queued via `queuedWrites.reordenarClientes`.
  - `addedClients.ts` & `queuedWrites.agregarClienteARuta` / `quitarClienteDeRuta`: adds ad-hoc or out-of-route customers directly into the day's route.
