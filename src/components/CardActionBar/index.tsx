import { View } from 'react-native';
import { CardActionButton } from '@/components/CardActionButton';
import { styles } from './styles';
import { CardActionBarProps } from './types';
import { filterValidCardActions } from './utils';

export function CardActionBar({ actions }: CardActionBarProps) {
  const validActions = filterValidCardActions(actions);

  return (
    <View style={styles.row}>
      {validActions.map(({ key, ...action }) => (
        <CardActionButton key={key} {...action} />
      ))}
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
