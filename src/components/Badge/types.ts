export type BadgeVariant = 'primary' | 'secondary' | 'error' | 'neutral';

export type BadgeSize = 'sm' | 'md';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
};
