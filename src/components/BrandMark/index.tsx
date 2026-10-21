import { Image } from 'react-native';
import { styles } from './styles';
import { BrandMarkProps } from './types';
import { getBrandMarkDimensions } from './utils';

/**
 * Insa logo — matches the ~192px-wide logo used across login_screen,
 * access_screen, and insa_date_selection_with_picker_popup.
 */
export function BrandMark({ size = 'lg' }: BrandMarkProps) {
  const { width, height } = getBrandMarkDimensions(size);

  return (
    <Image
      source={require('../../../assets/logo.png')}
      style={[styles.image, { width, height }]}
      resizeMode="contain"
    />
  );
}

export * from './types';
export * from './styles';
export * from './utils';
