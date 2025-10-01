import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  return (
    <BlurView
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={80}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.cardBackground + '95', // Semi-transparent
        }
      ]}
    />
  );
}