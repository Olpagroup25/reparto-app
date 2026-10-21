import { ViewStyle } from 'react-native';
import { CardAccentPosition } from './types';

/**
 * Generates border styling for top or left color accent bars.
 */
export function getCardAccentStyle(accentColor?: string, accentPosition: CardAccentPosition = 'top'): ViewStyle | null {
  if (!accentColor) return null;

  if (accentPosition === 'left') {
    return { borderLeftWidth: 4, borderLeftColor: accentColor };
  }

  return { borderTopWidth: 4, borderTopColor: accentColor };
}
