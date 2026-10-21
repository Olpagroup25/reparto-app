import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';

/** Logs in with a route/vehicle credential's login+password (see
 * repartoApiClient.ts — insa.repartidor.credencial, e.g. login
 * "reparto01@insareparto.local")
 * and persists the resulting session via expo-secure-store. */
export function useRepartoLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) =>
      repartoApiClient.login(login, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reparto', 'whoami'] }),
  });
}

/** Confirms the current token is still valid and returns route info. Pass
 * `enabled: false` until a session exists (e.g. before restoreSession()
 * resolves on app start) to avoid firing with no token. */
export function useWhoAmI(enabled: boolean = true) {
  return useQuery({
    queryKey: ['reparto', 'whoami'],
    queryFn: () => repartoApiClient.whoami(),
    enabled,
    retry: false,
  });
}

export function useRepartoLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => repartoApiClient.logout(),
    onSuccess: () => qc.removeQueries({ queryKey: ['reparto'] }),
  });
}
