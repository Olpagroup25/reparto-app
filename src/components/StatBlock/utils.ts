import { FlexAlignType } from 'react-native';
import { StatBlockAlign } from './types';

/**
 * Resolves FlexAlignType for container from StatBlockAlign value.
 */
export function getStatBlockAlignItems(align: StatBlockAlign = 'left'): FlexAlignType {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    case 'left':
    default:
      return 'flex-start';
  }
}
