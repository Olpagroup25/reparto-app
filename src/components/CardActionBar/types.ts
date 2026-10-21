import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type CardAction = {
  key: string;
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
};

export type CardActionBarProps = {
  actions: CardAction[];
};
