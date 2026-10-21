import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type FabVariant = 'primary' | 'secondary';

export type FabShape = 'circle' | 'rounded';

export type FloatingActionButtonProps = {
  icon: IconName;
  onPress: () => void;
  variant?: FabVariant;
  /** 'circle' matches the map FAB (rounded-full); 'rounded' matches the search FAB (rounded-2xl). */
  shape?: FabShape;
  /** Positioning (bottom/right offsets) is a screen-layout concern — pass it here. */
  style?: StyleProp<ViewStyle>;
};
