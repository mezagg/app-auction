import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent.blue,
        tabBarInactiveTintColor: colors.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 0,
          height: 85,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          shadowColor: colors.shadowDark,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Subastas',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="hammer.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="magnifyingglass" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-auctions"
        options={{
          title: 'Mis Subastas',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="person.crop.circle" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="person.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}