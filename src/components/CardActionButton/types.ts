import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type CardActionButtonProps = {
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
};
