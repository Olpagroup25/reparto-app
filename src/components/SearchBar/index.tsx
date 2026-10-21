import { Pressable, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';
import { SearchBarProps } from './types';
import { styles } from './styles';
import { DEFAULT_SEARCH_PLACEHOLDER } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

/** Matches the search-bar + filter-button row from hoja_de_ruta_todos. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = DEFAULT_SEARCH_PLACEHOLDER,
  onFilterPress,
}: SearchBarProps) {
  const hasValue = value.length > 0;

  return (
    <View style={styles.row}>
      <View style={styles.inputWrapper}>
        <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          style={[styles.input, hasValue && styles.inputWithClear]}
        />
        {hasValue ? (
          <Pressable
            style={styles.clearButton}
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <IconButton
          icon="filter-list"
          onPress={onFilterPress}
          color={colors.primary}
          backgroundColor={colors.surfaceContainerHigh}
        />
      ) : null}
    </View>
  );
}
