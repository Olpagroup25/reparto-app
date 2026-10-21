/**
 * Design tokens extracted from designs/style guide app/DESIGN.md ("Hydraulics Trust"
 * system) and cross-checked against every screen export's code.html file.
 *
 * Reconciliation notes (see chat for full detail):
 * - login_screen/code.html locally redefined `primary` to the palette's
 *   primary-container hex (#3d5a96) instead of true primary (#23427d). Treated as an
 *   export mistake; true primary is used here and the component will render darker
 *   than that one screenshot.
 * - Per-screen code.html borderRadius configs only ever redeclare a truncated
 *   4-step subset (DEFAULT/lg/xl/full) and disagree with each other on what DEFAULT
 *   means (0.25rem in most hoja_de_ruta/articulos screens, 0.5rem in
 *   dispensers/repuestos/access_screen). DESIGN.md's full 6-step scale is used as
 *   the source of truth instead.
 */

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

/** Raw Material3-style palette, verbatim from DESIGN.md. */
export const palette = {
  // Surfaces / neutrals
  surface: '#f8f9fa',
  surfaceDim: '#d9dadb',
  surfaceBright: '#f8f9fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  surfaceVariant: '#e1e3e4',
  surfaceTint: '#405d99',
  onSurface: '#191c1d',
  onSurfaceVariant: '#444750',
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f2',
  outline: '#747781',
  outlineVariant: '#c4c6d1',
  background: '#f8f9fa',
  onBackground: '#191c1d',

  // Primary (Deep Navy) — stability, security; headers & primary actions
  primary: '#23427d',
  onPrimary: '#ffffff',
  primaryContainer: '#3d5a96',
  onPrimaryContainer: '#c3d3ff',
  inversePrimary: '#afc6ff',
  primaryFixed: '#d9e2ff',
  primaryFixedDim: '#afc6ff',
  onPrimaryFixed: '#001a43',
  onPrimaryFixedVariant: '#264580',

  // Secondary (Vibrant Lime) — freshness / high-priority actions / success
  secondary: '#546500',
  onSecondary: '#ffffff',
  secondaryContainer: '#cfec5c',
  onSecondaryContainer: '#586a00',
  secondaryFixed: '#d2ef5f',
  secondaryFixedDim: '#b6d245',
  onSecondaryFixed: '#181e00',
  onSecondaryFixedVariant: '#3f4c00',

  // Tertiary (Sky Blue) — backgrounds, subtle borders, informational accents
  tertiary: '#1a495a',
  onTertiary: '#ffffff',
  tertiaryContainer: '#356173',
  onTertiaryContainer: '#aedaef',
  tertiaryFixed: '#bce9fe',
  tertiaryFixedDim: '#a1cde1',
  onTertiaryFixed: '#001f29',
  onTertiaryFixedVariant: '#1e4c5d',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Warning (Amber) — added for Plan de Trabajo Paso 2.1 / supuesto 0.4:
  // no source screen ever called for this role, no hex to extract. Hand-picked
  // amber with the same structure as `error` above (dark saturated base for
  // text/icons, light container for tinted backgrounds).
  warning: '#7a5900',
  onWarning: '#ffffff',
  warningContainer: '#ffdf99',
  onWarningContainer: '#271900',
} as const;

/**
 * Semantic roles. Components should consume these, not `palette`, directly —
 * the palette above stays as the reconciliation reference for future retheming.
 *
 * `success` maps to `secondary`/`onSecondary` per DESIGN.md's component spec
 * ("Success/Action: Solid Secondary Green with white text").
 *
 * `warning` (Plan de Trabajo Paso 2.1 / supuesto 0.4): the client described a
 * three-color logic (red/amber/green) for envases and Liquidación, not the
 * two colors the source screens shipped with — see palette.warning above for
 * why the hex is hand-picked rather than extracted. Liquidación itself
 * (Paso 2.9) doesn't exist as a screen yet — this token is added ahead of
 * that screen, not applied to anything today. Supuesto 0.4 also settled
 * "red text, not a full filled row" for differences; nothing in the app
 * currently does a full-fill treatment that needed correcting.
 */
export const colors = {
  primary: palette.primary,
  onPrimary: palette.onPrimary,
  primaryContainer: palette.primaryContainer,
  onPrimaryContainer: palette.onPrimaryContainer,

  secondary: palette.secondary,
  onSecondary: palette.onSecondary,
  secondaryContainer: palette.secondaryContainer,
  onSecondaryContainer: palette.onSecondaryContainer,

  success: palette.secondary,
  onSuccess: palette.onSecondary,
  successContainer: palette.secondaryContainer,
  onSuccessContainer: palette.onSecondaryContainer,

  info: palette.tertiary,
  onInfo: palette.onTertiary,
  infoContainer: palette.tertiaryContainer,
  onInfoContainer: palette.onTertiaryContainer,

  error: palette.error,
  onError: palette.onError,
  errorContainer: palette.errorContainer,
  onErrorContainer: palette.onErrorContainer,

  warning: palette.warning,
  onWarning: palette.onWarning,
  warningContainer: palette.warningContainer,
  onWarningContainer: palette.onWarningContainer,

  background: palette.background,
  onBackground: palette.onBackground,
  surface: palette.surface,
  onSurface: palette.onSurface,
  surfaceVariant: palette.surfaceVariant,
  onSurfaceVariant: palette.onSurfaceVariant,
  surfaceContainerLowest: palette.surfaceContainerLowest,
  surfaceContainerLow: palette.surfaceContainerLow,
  surfaceContainer: palette.surfaceContainer,
  surfaceContainerHigh: palette.surfaceContainerHigh,
  surfaceContainerHighest: palette.surfaceContainerHighest,

  outline: palette.outline,
  outlineVariant: palette.outlineVariant,
  inverseSurface: palette.inverseSurface,
  inverseOnSurface: palette.inverseOnSurface,
  inversePrimary: palette.inversePrimary,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Font family is "Source Sans 3" everywhere in the designs. Expo/React Native
 * needs one distinct family name per weight when loaded via
 * @expo-google-fonts/source-sans-3 — set those up in app bootstrap (Step 3)
 * and keep the names below in sync with whatever is passed to useFonts().
 */
export const fontFamily = {
  regular: 'SourceSans3_400Regular',
  medium: 'SourceSans3_500Medium',
  semiBold: 'SourceSans3_600SemiBold',
  bold: 'SourceSans3_700Bold',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
};

export const typography: Record<
  'display' | 'headlineLg' | 'headlineMd' | 'bodyLg' | 'bodyMd' | 'labelLg' | 'labelSm',
  TypeStyle
> = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    letterSpacing: -0.96, // -0.02em @ 48px
  },
  headlineLg: {
    fontFamily: fontFamily.semiBold,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
  },
  headlineMd: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  labelLg: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.7, // 0.05em @ 14px
  },
  labelSm: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};

// ---------------------------------------------------------------------------
// Spacing (4px baseline, verbatim across every screen that declared it)
// ---------------------------------------------------------------------------

export const spacing = {
  base: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 48,
  gutter: 24,
  marginMobile: 16,
  marginDesktop: 64,
} as const;

// ---------------------------------------------------------------------------
// Border radius (DESIGN.md's full scale; see reconciliation note at top)
// ---------------------------------------------------------------------------

export const radii = {
  none: 0,
  sm: 4, // 0.25rem
  base: 8, // 0.5rem — DESIGN.md "DEFAULT"; standard buttons/inputs
  md: 12, // 0.75rem
  lg: 16, // 1rem — feature cards
  xl: 24, // 1.5rem
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Elevation (DESIGN.md "Elevation & Depth": tinted, not pure-black, shadows)
// ---------------------------------------------------------------------------

export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Cards / containers: blur 12, y 4, 4% primary navy — matches the
  // `shadow-[0_4px_12px_rgba(35,66,125,0.04)]` class reused across every
  // hoja_de_ruta card.
  level1: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  // Overlays / modals: higher-contrast tinted shadow; pair with a 1px
  // tertiary-container border per DESIGN.md.
  level2: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  palette,
  typography,
  fontFamily,
  spacing,
  radii,
  elevation,
} as const;

export type Theme = typeof theme;

export default theme;
