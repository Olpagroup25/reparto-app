# TextField

Versatile text input field supporting labels, error messages, left icon/prefix text, right action buttons (e.g. password visibility toggle), and focused/disabled states.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`TextFieldProps`) and icon name type (`IconName`).
- `styles.ts`: StyleSheet definitions for label, wrapper, input borders, error state, and icons.
- `utils.ts`: Helper functions for icon color resolution (`getLeftIconColor`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: IconName;
  leftText?: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
};
```

## Logic & Utils

- Focus management updating border stroke dynamically.
- `getLeftIconColor(editable: boolean)`: Resolves icon color depending on editability.

## Styles

- Label typography with `typography.labelLg`
- Focus indicator: 2px border with `colors.primary`
- Error indicator: 2px border with `colors.error` and `colors.errorContainer` background
- Disabled state with `colors.surfaceContainerHigh`

## Usage Example

```tsx
import { TextField } from '@/components/TextField';

<TextField
  label="Precio unitario"
  leftText="$"
  value={price}
  onChangeText={setPrice}
  keyboardType="numeric"
/>
```
