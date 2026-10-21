import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { Button } from '@/components/Button';
import { ReorderItem, ReorderModalProps } from './types';
import { styles } from './styles';
import { reorderItems, extractOrderedIds } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

/**
 * Full-screen bottom-sheet modal that lets the repartidor reorder the
 * day's client list using ▲ / ▼ arrow buttons per row, then save.
 *
 * Activated by long-pressing a ClientCard in HojaDeRutaScreen (interactive
 * mode). The new order is persisted locally via clientOrder.ts and
 * synchronized with Odoo's fsm.route.dayroute.
 *
 * Design rationale: no drag-and-drop (avoids react-native-gesture-handler
 * native setup). Arrow buttons are large enough to be usable with gloves /
 * one hand, which matches the field context.
 */
export function ReorderModal({ visible, items, onSave, onClose }: ReorderModalProps) {
  const [list, setList] = useState<ReorderItem[]>([]);

  // Sync internal state when the modal opens with fresh data.
  // We use `visible` as the trigger so any external list changes are picked
  // up every time the modal re-opens rather than sticking to the first render.
  const [lastVisible, setLastVisible] = useState(false);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) setList([...items]);
  }

  function move(index: number, direction: -1 | 1) {
    const updated = reorderItems(list, index, direction);
    setList(updated);
  }

  function handleSave() {
    onSave(extractOrderedIds(list));
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Tap outside to dismiss */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="drag-indicator" size={22} color={colors.primary} />
              <Text style={styles.headerTitle}>Ordenar clientes</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{list.length}</Text>
            </View>
          </View>

          {/* Instruction */}
          <View style={styles.hint}>
            <MaterialIcons name="info-outline" size={15} color={colors.onSurfaceVariant} />
            <Text style={styles.hintText}>
              Usá las flechas para cambiar el orden. El cambio se sincroniza con la hoja de ruta.
            </Text>
          </View>

          {/* Reorderable list */}
          <FlatList
            data={list}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                {/* Position number */}
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{index + 1}</Text>
                </View>

                {/* Client info */}
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {item.sublabel ? (
                    <Text style={styles.rowSublabel} numberOfLines={1}>
                      {item.sublabel}
                    </Text>
                  ) : null}
                </View>

                {/* Arrow buttons */}
                <View style={styles.arrows}>
                  <Pressable
                    style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
                    onPress={() => move(index, -1)}
                    disabled={index === 0}
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={26}
                      color={index === 0 ? colors.outlineVariant : colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.arrowBtn,
                      index === list.length - 1 && styles.arrowBtnDisabled,
                    ]}
                    onPress={() => move(index, 1)}
                    disabled={index === list.length - 1}
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={26}
                      color={
                        index === list.length - 1 ? colors.outlineVariant : colors.primary
                      }
                    />
                  </Pressable>
                </View>
              </View>
            )}
          />

          {/* Footer actions */}
          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="tertiary"
              shape="base"
              style={styles.footerBtn}
              onPress={onClose}
            />
            <Button
              title="Guardar orden"
              variant="primary"
              shape="base"
              style={styles.footerBtn}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
