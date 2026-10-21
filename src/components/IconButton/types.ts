import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};
