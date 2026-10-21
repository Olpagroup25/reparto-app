import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export type AccessScreenProps = NativeStackScreenProps<RootStackParamList, 'Access'>;

export interface FactoryInfo {
  name: string;
  code: string;
}
