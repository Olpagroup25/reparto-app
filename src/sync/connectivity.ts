/**
 * Thin wrapper over `@react-native-community/netinfo` — the app only ever
 * needs one boolean ("can I reach the backend right now?") plus a way to be
 * told when it flips.
 *
 * `isInternetReachable` is `null` until NetInfo has run its first reachability
 * probe; we treat `null` as "assume online" so a fresh app start doesn't
 * wrongly block a sync.
 */
import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface ConnectivitySnapshot {
  /** A network interface is up. */
  isConnected: boolean;
  /** NetInfo's reachability probe succeeded (`null` = not determined yet). */
  isInternetReachable: boolean | null;
  /** 'wifi' | 'cellular' | 'none' | 'unknown' | ... */
  type: string;
  /** The one value callers usually want: connected AND not known-unreachable. */
  online: boolean;
}

export function toSnapshot(state: NetInfoState): ConnectivitySnapshot {
  const isConnected = state.isConnected ?? false;
  const isInternetReachable = state.isInternetReachable;
  return {
    isConnected,
    isInternetReachable,
    type: state.type,
    online: isConnected && isInternetReachable !== false,
  };
}

/** One-shot check, e.g. right before kicking off a sync run. */
export async function getIsOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return toSnapshot(state).online;
}

/** Subscribe to online/offline transitions. Returns an unsubscribe fn. */
export function subscribeOnline(listener: (online: boolean) => void): () => void {
  let last: boolean | null = null;
  return NetInfo.addEventListener((state) => {
    const next = toSnapshot(state).online;
    if (next !== last) {
      last = next;
      listener(next);
    }
  });
}

/** Live connectivity for components (status pill on the Sync tab, etc.). */
export function useConnectivity(): ConnectivitySnapshot {
  const [snapshot, setSnapshot] = useState<ConnectivitySnapshot>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    online: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setSnapshot(toSnapshot(state)));
    NetInfo.fetch().then((state) => setSnapshot(toSnapshot(state)));
    return unsubscribe;
  }, []);

  return snapshot;
}
