import { CardAction } from './types';

/**
 * Validates and filters valid card action items.
 */
export function filterValidCardActions(actions: CardAction[]): CardAction[] {
  return actions.filter((action) => Boolean(action.key && action.label && action.icon && action.onPress));
}
