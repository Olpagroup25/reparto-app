import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export type DateSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'DateSelection'>;

export interface CalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
