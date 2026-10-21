import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};
