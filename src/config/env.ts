import Constants from 'expo-constants';

/**
 * Single source of truth for environment-dependent config.
 *
 * Orden de resolución del environment activo:
 *  1. `EXPO_PUBLIC_ODOO_ENV` — variable de entorno inyectada por el perfil
 *     de EAS Build (eas.json: staging / production). Este es el mecanismo
 *     correcto para builds distribuidos: no se toca app.json entre builds.
 *  2. `app.json extra.environment` — fallback para `expo start` local
 *     (desarrollo sin EAS), donde las EXPO_PUBLIC_* no se inyectan por eas.
 *  3. `'production'` — si ninguno de los anteriores está definido.
 *
 * El mapa de URL/DB por ambiente vive en `app.json extra.environments`, igual
 * que antes. EAS solo cambia cuál clave de ese mapa se activa, sin duplicar
 * las URLs en el código ni en eas.json.
 *
 * ⚠️ En dispositivo físico (Expo Go sobre QR) o emulador Android,
 * `localhost` refiere al propio dispositivo — usar la IP LAN de la máquina
 * (ej. http://192.168.1.23:8069) o 10.0.2.2 para el emulador Android.
 */
type EnvironmentConfig = {
  odooBaseUrl: string;
  odooDb: string;
};

type Extra = {
  environment?: string;
  environments?: Record<string, EnvironmentConfig>;
  odooBaseUrl?: string;
  odooDb?: string;
};

const extra = Constants.expoConfig?.extra as Partial<Extra> | undefined;

/**
 * Ambiente activo: EXPO_PUBLIC_ODOO_ENV (EAS) > extra.environment (app.json) > 'production'.
 * Se exporta para que pantallas de debug o logs puedan mostrarlo.
 */
export const ACTIVE_ENV: string =
  process.env.EXPO_PUBLIC_ODOO_ENV ||
  extra?.environment ||
  'production';

function required(key: keyof EnvironmentConfig): string {
  // 1. Mapa de ambientes en app.json (fuente canónica de URLs/DBs)
  const envConfig =
    extra?.environments && ACTIVE_ENV in extra.environments
      ? extra.environments[ACTIVE_ENV]
      : undefined;

  // 2. Fallback plano en extra (compatibilidad con instalaciones que no usan el mapa)
  const value = envConfig?.[key] ?? extra?.[key];

  if (!value) {
    throw new Error(
      `Missing "${key}" for environment "${ACTIVE_ENV}" in app.json's expo.extra block. ` +
      `Set it under extra.environments.${ACTIVE_ENV}.${key} (see src/config/env.ts).`,
    );
  }
  return key === 'odooBaseUrl' ? value.replace(/\/+$/, '') : value;
}

export const ODOO_BASE_URL = required('odooBaseUrl');
export const ODOO_DB = required('odooDb');
