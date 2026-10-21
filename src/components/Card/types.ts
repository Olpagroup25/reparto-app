import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type CardAccentPosition = 'top' | 'left';

export type CardProps = {
  children: ReactNode;
  /** Accent bar color, e.g. colors.error or colors.success — used on hoja_de_ruta cards. */
  accentColor?: string;
  accentPosition?: CardAccentPosition;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  /**
   * When provided, the card becomes pressable-long: triggers a long-press gesture.
   * Used by ClientCard to open the reorder modal without affecting standard Card views.
   */
  onLongPress?: () => void;
};
