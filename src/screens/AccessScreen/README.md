# AccessScreen

## 1. Purpose
`AccessScreen` is the central operational landing hub displayed after date selection. It serves as the bridge between authentication context, dayroute execution (`HojaDeRutaScreen`), and pre/post-shift truck loading verification (`ControlDePlayaDialog`).

## 2. File Structure
```
AccessScreen/
├── index.tsx     # Main container view and user interactions
├── types.ts     # Navigation params, component props, and factory model types
├── styles.ts    # Extracted StyleSheet definitions and design tokens
├── utils.ts     # Default factory constants and version information
└── README.md    # Technical architecture & integration documentation
```

## 3. Types & Props
- `AccessScreenProps`: Typed via `NativeStackScreenProps<RootStackParamList, 'Access'>`, expecting `deliveryDate: string` (YYYY-MM-DD) in `route.params`.
- `FactoryInfo`: Interface representing the production plant / depot entity (`name`, `code`).

## 4. Extracted Business Logic & Utils
- **Queue Guard on Logout (`handleLogout`)**: Checks `syncCounts.unsynced` from `useSync()`. If there are pending offline mutations, displays an alert warning that logging out may strand unsynced queue operations tagged to this user/route session.
- **Factory Metadata (`DEFAULT_FACTORY`)**: Default plant context constant (`Fabrica 13`, `365574`).
- **Version Stamp (`APP_VERSION`)**: App build version banner displayed at the bottom.

## 5. Styles
- Styled using design tokens (`colors`, `spacing`, `typography`) from `src/theme/tokens`.
- Features centered layout container, user profile header with avatar circle and role badge, plant title text, action button stack, and pinned footer version tag.

## 6. Odoo / Offline Sync Integration
- Consumes `AuthContext` to display user initials, display name, and role.
- Interacts with `SyncProvider` to inspect unsynced operation counts before terminating the session.
- Embeds `ControlDePlayaDialog` passing the active `deliveryDate`.
