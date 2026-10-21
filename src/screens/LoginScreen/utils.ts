import { RepartoApiError } from '@/api/repartoApiClient';

export const APP_VERSION = 'Version 1.7.8';

/**
 * Format login error message based on error type.
 */
export function formatLoginError(error: unknown): string {
  if (error instanceof RepartoApiError) {
    return error.message;
  }
  return 'No se pudo conectar. Intentá de nuevo.';
}
