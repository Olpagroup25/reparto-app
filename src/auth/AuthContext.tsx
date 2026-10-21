import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RepartoApiError, repartoApiClient } from '@/api/repartoApiClient';
import type { AuthErrorCode, RepartoSession } from '@/api/types';
import { useRepartoLogin, useRepartoLogout } from '@/hooks/useRepartoAuth';

/**
 * View-model shape screens render (AccessScreen's header, HojaDeRutaScreen's
 * DrawerMenu footer) — kept identical to the old mock-data shape so those
 * screens didn't need to change, even though the data now comes from a real
 * route/vehicle credential (insa.repartidor.credencial) instead of a person.
 * There's no person's name behind a route login, so `displayName` is the
 * credential's own login ("reparto01@insareparto.local") and `role` is a fixed label — revisit
 * if/when the backend exposes anything more specific.
 */
export type AuthUser = {
  displayName: string;
  role: string;
  initials: string;
};

function toAuthUser(session: RepartoSession): AuthUser {
  return {
    displayName: session.login,
    role: 'Repartidor',
    initials: `R${String(session.numeroReparto).padStart(2, '0')}`,
  };
}

/**
 * Mensaje de error de sesión que AuthContext inyecta en el estado para que
 * LoginScreen lo muestre después de un logout forzado. Distingue los tres
 * casos de error de autenticación que el backend puede devolver durante una
 * sesión activa (ver classifyAuthError en repartoApiClient.ts).
 */
export type SessionErrorMessage = {
  code: AuthErrorCode;
  text: string;
};

const AUTH_ERROR_TEXTS: Record<AuthErrorCode, string> = {
  sesion_revocada:
    'Tu sesión fue cerrada desde otro dispositivo. Volvé a iniciar sesión.',
  token_expirado:
    'Tu sesión expiró. Volvé a iniciar sesión.',
  token_invalido:
    'Tu sesión no es válida. Volvé a iniciar sesión.',
  credencial_bloqueada:
    'Tu usuario está bloqueado temporalmente por intentos fallidos. Esperá unos minutos.',
};

type AuthContextValue = {
  user: AuthUser | null;
  /** True while a stored session (expo-secure-store) is being restored and
   * revalidated against /insa/api/whoami on app start. RootNavigator gates
   * its first render on this to decide Login vs. skipping straight past it,
   * and to avoid flashing the Login screen for an already-signed-in user. */
  isRestoring: boolean;
  /** True while a login request is in flight. */
  isLoggingIn: boolean;
  /**
   * Mensaje de error de sesión para mostrar en LoginScreen después de un
   * logout forzado por token expirado, sesión revocada, etc.
   * Se limpia automáticamente al hacer login o logout manual.
   */
  sessionError: SessionErrorMessage | null;
  /** Logs in against insa_reparto's real backend
   * (insa.repartidor.credencial's login/password — see repartoApiClient.ts).
   * Throws RepartoApiError with a user-facing Spanish message on bad
   * credentials — callers should catch and display `error.message`. */
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RepartoSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionError, setSessionError] = useState<SessionErrorMessage | null>(null);
  const loginMutation = useRepartoLogin();
  const logoutMutation = useRepartoLogout();

  // Ref para que el callback de error de auth no capture valores stale de
  // setSession — lo que necesita es solo desloguear y guardar el mensaje.
  const logoutRef = useRef<(() => Promise<void>) | undefined>(undefined);

  /**
   * Handler registrado en repartoApiClient para recibir errores de
   * autenticación que ocurren durante requests ya autenticados.
   *
   * Solo se invoca para `token_invalido`, `token_expirado` y `sesion_revocada`
   * (ver setAuthErrorHandler en repartoApiClient.ts). La app navega a Login
   * automáticamente porque setSession(null) es detectado por RootNavigator.
   *
   * useCallback + dependencias vacías: este handler se registra una sola vez
   * al montar el Provider y no cambia — repartoApiClient lo almacena como
   * referencia fija. Sin useCallback la referencia cambia en cada render y
   * el cliente tendría que re-registrarla constantemente.
   */
  const handleAuthError = useCallback(async (code: AuthErrorCode, _rawMsg: string) => {
    // Solo hacer logout si hay sesión activa — evitar loops si whoami() falla
    // durante el restore de sesión al arrancar (ese caso se maneja en el
    // useEffect de abajo, no acá).
    if (logoutRef.current) {
      await logoutRef.current();
    }
    setSessionError({ code, text: AUTH_ERROR_TEXTS[code] });
  }, []);

  // Registrar el handler en el cliente al montar. Se limpia al desmontar
  // (aunque AuthProvider nunca se desmonta en producción).
  useEffect(() => {
    repartoApiClient.setAuthErrorHandler(handleAuthError);
    return () => {
      repartoApiClient.setAuthErrorHandler(null);
    };
  }, [handleAuthError]);

  // On app start: read whatever's in secure-store, then confirm with the
  // backend that the token hasn't expired/been revoked before trusting it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await repartoApiClient.restoreSession();
      if (!stored) {
        if (!cancelled) setIsRestoring(false);
        return;
      }
      try {
        const fresh = await repartoApiClient.whoami();
        if (!cancelled) setSession(fresh);
      } catch (err) {
        // Token expirado/revocado al arrancar → borrar la sesión y mostrar
        // el error correspondiente. Si es un error de red (sin código de auth)
        // se deja la sesión guardada para que el usuario pueda reintentar.
        const isAuthErr = err instanceof RepartoApiError && err.code !== 'generic';
        await repartoApiClient.logout();
        if (!cancelled && isAuthErr) {
          const code = (err as RepartoApiError).code as AuthErrorCode;
          setSessionError({ code, text: AUTH_ERROR_TEXTS[code] });
        }
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const doLogout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    setSession(null);
    setSessionError(null);
  }, [logoutMutation]);

  // Mantener logoutRef sincronizado para que handleAuthError pueda usar
  // la versión más fresca de doLogout sin re-registrar el handler.
  useEffect(() => {
    logoutRef.current = doLogout;
  }, [doLogout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session ? toAuthUser(session) : null,
      isRestoring,
      isLoggingIn: loginMutation.isPending,
      sessionError,
      login: async (login, password) => {
        setSessionError(null);
        const result = await loginMutation.mutateAsync({ login, password });
        setSession(result);
      },
      logout: doLogout,
    }),
    [session, isRestoring, loginMutation, sessionError, doLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
