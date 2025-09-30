// This file is a fallback for using MaterialIcons from @expo/vector-icons
// when the Expo Symbols module is not available.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue } from 'react-native';

// Map of icon names for the symbol-to-MaterialIcon conversion
const MAPPING = {
  'hammer.fill': 'gavel',
  'magnifyingglass': 'search',
  'person.crop.circle': 'account-circle',
  'person.fill': 'person',
  'calendar': 'event',
  'location': 'location-on',
  'arrow.left': 'arrow-back',
  'star': 'star',
  'star.fill': 'star',
  'chevron.right': 'chevron-right',
  'plus': 'add',
  'minus': 'remove',
  'checkmark': 'check',
  'xmark': 'close',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses the system-provided SF Symbols on iOS, 
 * and MaterialIcons on Android and web. This ensures a consistent 
 * look while adhering to platform conventions.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} />;
}