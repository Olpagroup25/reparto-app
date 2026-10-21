import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';
import { TextFieldProps } from './types';
import { styles } from './styles';
import { getLeftIconColor } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

export function TextField({
  label,
  error,
  editable = true,
  containerStyle,
  leftIcon,
  leftText,
  rightIcon,
  onRightIconPress,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        {leftIcon ? (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={getLeftIconColor(editable)}
            style={styles.leftIcon}
          />
        ) : leftText ? (
          <Text style={[styles.leftText, !editable && styles.leftTextDisabled]}>
            {leftText}
          </Text>
        ) : null}
        <TextInput
          {...inputProps}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.outline}
          style={[
            styles.input,
            (leftIcon || leftText) ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithIcon : null,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            !editable && styles.inputDisabled,
          ]}
        />
        {rightIcon ? (
          <IconButton
            icon={rightIcon}
            onPress={onRightIconPress}
            color={colors.onSurfaceVariant}
            size={20}
            style={styles.rightIcon}
          />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
