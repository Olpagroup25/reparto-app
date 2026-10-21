import { Pressable, View } from 'react-native';
import { styles } from './styles';
import { CardProps } from './types';
import { getCardAccentStyle } from './utils';

export function Card({
  children,
  accentColor,
  accentPosition = 'top',
  padded = true,
  style,
  onLongPress,
}: CardProps) {
  const accentStyle = getCardAccentStyle(accentColor, accentPosition);
  const containerStyle = [
    styles.base,
    padded && styles.padded,
    accentStyle,
    style,
  ];

  if (onLongPress) {
    return (
      <Pressable style={containerStyle} onLongPress={onLongPress} delayLongPress={400}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

export * from './types';
export * from './styles';
export * from './utils';
