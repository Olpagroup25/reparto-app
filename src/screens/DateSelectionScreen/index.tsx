import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandMark, Button, Dialog, IconButton, ScreenContainer } from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { colors } from '@/theme/tokens';
import { styles } from './styles';
import type { DateSelectionScreenProps } from './types';
import {
  buildCalendarGrid,
  chunkIntoWeeks,
  isAfterToday,
  isCurrentMonthOrFuture,
  isSameDay,
  isoDate,
  MONTHS_ES,
  navigateMonth,
  WEEKDAYS_LONG_ES,
  WEEKDAYS_SHORT_ES,
} from './utils';

export type { CalendarCell, DateSelectionScreenProps } from './types';

export function DateSelectionScreen({ navigation, route }: DateSelectionScreenProps) {
  const { logout } = useAuth();
  const initialDateStr = route.params?.initialDate;

  const parseDate = (dStr?: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return new Date();
  };

  const initialDate = useMemo(() => parseDate(initialDateStr), [initialDateStr]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [pendingDate, setPendingDate] = useState(initialDate);

  useEffect(() => {
    if (initialDateStr) {
      const parsed = parseDate(initialDateStr);
      setSelectedDate(parsed);
      setPendingDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [initialDateStr]);

  const isFutureMonth = isCurrentMonthOrFuture(viewYear, viewMonth, today);

  const openCalendar = () => {
    setPendingDate(selectedDate);
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
    setCalendarVisible(true);
  };

  const changeMonth = (delta: number) => {
    if (delta > 0 && isFutureMonth) {
      return;
    }
    const next = navigateMonth(viewYear, viewMonth, delta);
    setViewMonth(next.month);
    setViewYear(next.year);
  };

  const confirmDate = () => {
    if (isAfterToday(pendingDate, today)) {
      return;
    }
    setSelectedDate(pendingDate);
    setCalendarVisible(false);
  };

  const cells = buildCalendarGrid(viewYear, viewMonth);

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <View style={styles.header}>
        <BrandMark size="lg" />
      </View>

      <View style={styles.body}>
        <Text style={styles.headline}>Seleccione la fecha de reparto</Text>

        <Pressable style={styles.dateCard} onPress={openCalendar}>
          <View style={styles.dateIconCircle}>
            <MaterialIcons name="calendar-today" size={32} color={colors.primary} />
          </View>
          <Text style={styles.dateText}>{isoDate(selectedDate)}</Text>
          <Text style={styles.weekdayText}>{WEEKDAYS_LONG_ES[selectedDate.getDay()].toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button
          title="Cancelar"
          variant="neutral"
          shape="base"
          onPress={async () => {
            if (initialDateStr) {
              navigation.replace('Access', { deliveryDate: initialDateStr });
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              await logout();
              navigation.replace('Login');
            }
          }}
          style={styles.footerButton}
        />
        <Button
          title="Aceptar"
          variant="primary"
          shape="base"
          onPress={() => navigation.replace('Access', { deliveryDate: isoDate(selectedDate) })}
          style={styles.footerButton}
        />
      </View>

      <Dialog
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        footer={
          <>
            <Button
              title="Cancelar"
              variant="neutral"
              shape="base"
              onPress={() => setCalendarVisible(false)}
              style={styles.footerButton}
            />
            <Button
              title="Confirmar"
              variant="primary"
              shape="base"
              onPress={confirmDate}
              style={styles.footerButton}
            />
          </>
        }
      >
        <View style={styles.calendarHeader}>
          <IconButton icon="chevron-left" onPress={() => changeMonth(-1)} />
          <Text style={styles.calendarTitle}>
            {MONTHS_ES[viewMonth]} {viewYear}
          </Text>
          <IconButton
            icon="chevron-right"
            disabled={isFutureMonth}
            onPress={() => changeMonth(1)}
          />
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS_SHORT_ES.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {chunkIntoWeeks(cells).map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((cell, dayIndex) => {
                const isFuture = isAfterToday(cell.date, today);
                const selected = !isFuture && isSameDay(cell.date, pendingDate);
                return (
                  <Pressable
                    key={dayIndex}
                    disabled={isFuture}
                    style={[
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      isFuture && styles.dayCellDisabled,
                    ]}
                    onPress={() => {
                      if (!isFuture) {
                        setPendingDate(cell.date);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !cell.currentMonth && styles.dayTextMuted,
                        isFuture && styles.dayTextDisabled,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Dialog>
    </ScreenContainer>
  );
}
