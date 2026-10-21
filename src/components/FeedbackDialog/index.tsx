import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { FeedbackDialogProps } from './types';
import { getFeedbackConfig } from './utils';

export function FeedbackDialog({
  visible,
  type = 'info',
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
  confirmLoading = false,
  autoCloseMs,
}: FeedbackDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = getFeedbackConfig(type);
  const finalTitle = title || config.defaultTitle;
  const finalConfirmText = confirmText || (type === 'confirm' ? 'Confirmar' : 'Aceptar');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoCloseMs && autoCloseMs > 0 && (type === 'success' || type === 'info')) {
        const timer = setTimeout(() => {
          if (onClose) onClose();
          else if (onConfirm) onConfirm();
        }, autoCloseMs);
        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, autoCloseMs, type]);

  const handleBackdropPress = () => {
    if (type === 'loading') return; // Do not close if loading
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Cerrar modal"
        />

        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Icon Container */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: config.bgColor }]}>
              {type === 'loading' ? (
                <ActivityIndicator size="large" color={config.iconColor} />
              ) : (
                <MaterialIcons name={config.icon} size={40} color={config.iconColor} />
              )}
            </View>
          </View>

          {/* Texts */}
          <View style={styles.content}>
            <Text style={styles.title}>{finalTitle}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Action Buttons */}
          {type !== 'loading' ? (
            <View style={styles.actions}>
              {type === 'confirm' ? (
                <Button
                  title={cancelText}
                  variant="neutral"
                  shape="pill"
                  onPress={handleCancel}
                  style={styles.actionBtn}
                  disabled={confirmLoading}
                />
              ) : null}

              <Button
                title={finalConfirmText}
                variant={config.confirmVariant}
                shape="pill"
                onPress={handleConfirm}
                style={styles.actionBtn}
                loading={confirmLoading}
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
