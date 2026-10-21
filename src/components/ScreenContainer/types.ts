import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Edge } from 'react-native-safe-area-context';

export type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /**
   * Which edges to safe-area-pad. Defaults to top/left/right for plain content
   * screens. If the screen's first/last child is TopAppBar/BottomNavBar —
   * which pad their own top/bottom insets for the edge-to-edge look — exclude
   * that edge here (e.g. `edges={['left', 'right']}`) to avoid double-padding.
   */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};
