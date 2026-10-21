import { StyleProp, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'tertiary' | 'neutral';

export type ButtonShape = 'pill' | 'base' | 'md';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /**
   * 'pill' (default, radii.full) matches most hoja_de_ruta/control_de_playa CTAs.
   * 'base' (radii.base, 8px) matches access_screen's stacked menu options and date-selection's footer buttons.
   * 'md' (radii.md, 12px) matches primary action buttons on empty states.
   */
  shape?: ButtonShape;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};
