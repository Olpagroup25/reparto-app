# LoginScreen

## Purpose
`LoginScreen` provides the initial authentication interface for delivery drivers (repartidores). The credentials authenticate the route/vehicle session with the Odoo backend (`insa.repartidor.credencial`), enabling access to dayroutes, stock tracking, and visit logging.

## File Structure
- `index.tsx`: Core screen component handling user interaction, form inputs, session banner display, and navigation upon successful login.
- `types.ts`: Screen navigation prop definitions (`LoginScreenProps`).
- `styles.ts`: Presentation styling using theme tokens (colors, typography, spacing).
- `utils.ts`: Authentication error formatting and app version constant.
- `README.md`: Architectural documentation for the module.

## Types & Props
- `LoginScreenProps`: React Navigation stack screen props for the `'Login'` route in `RootStackParamList`.

## Extracted Business Logic & Utils
- `formatLoginError(error: unknown)`: Parses `RepartoApiError` into a driver-friendly message or returns a general fallback.
- `APP_VERSION`: Current application version display constant (`Version 1.7.8`).

## Styles
- Center-aligned layout with max width 400px container for cross-device consistency.
- Explicit visual distinction between session expiration banners (orange container) and credential errors (red text).

## Odoo / Offline Sync Integration
- Integrates with `useAuth` which communicates with `POST /insa/api/auth/login`.
- Stores bearer token in secure device storage for subsequent authenticated REST requests.
- When remote session revocation or token expiration occurs, displays the received session notification banner.
