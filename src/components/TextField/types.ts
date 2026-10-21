import { ComponentProps } from 'react';
import { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** No design file shows an errored input; styling here follows the same
   * error/onError tokens used elsewhere (error-container fields, error text). */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional icon on the left edge — e.g. 'attach-money' for price / currency fields. */
  leftIcon?: IconName;
  /** Optional static text prefix on the left edge — e.g. '$'. */
  leftText?: string;
  /** Optional tappable icon on the right edge — e.g. the show/hide-password
   * eye toggle on login and any other secureTextEntry field. Absent by
   * default; every existing call site is unaffected. */
  rightIcon?: IconName;
  onRightIconPress?: () => void;
};
