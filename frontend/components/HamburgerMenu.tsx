import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onFAQ: () => void;
  onSupport: () => void;
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  colors: any;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, colors }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuItemIcon, { backgroundColor: colors.accent.blue + '20' }]}>
      <IconSymbol name={icon as any} size={24} color={colors.accent.blue} />
    </View>
    <View style={styles.menuItemContent}>
      <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.menuItemSubtitle, { color: colors.secondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
    <IconSymbol name="chevron.right" size={16} color={colors.secondary} />
  </TouchableOpacity>
);

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isVisible,
  onClose,
  onLogin,
  onFAQ,
  onSupport,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { theme, toggleTheme, setTheme } = useThemeContext();
  const isDark = theme === 'dark';
  
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, overlayOpacity]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Menu */}
      <Animated.View
        style={[
          styles.menu,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={[colors.background, colors.cardBackground]}
          style={styles.menuGradient}
        >
          <SafeAreaView style={styles.menuContent}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={styles.logoContainer}>
                <View style={[styles.logoCircle, { backgroundColor: colors.accent.blue }]}>
                  <Text style={[styles.logoText, { color: colors.white }]}>H</Text>
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Subastas HILCO
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
                    Plataforma Profesional
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <IconSymbol name="xmark" size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              <MenuItem
                icon="person.crop.circle"
                title="Iniciar Sesión"
                subtitle="Accede a tu cuenta"
                onPress={onLogin}
                colors={colors}
              />
              
              <MenuItem
                icon="star"
                title="Preguntas Frecuentes"
                subtitle="Encuentra respuestas rápidas"
                onPress={onFAQ}
                colors={colors}
              />
              
              <MenuItem
                icon="heart"
                title="Soporte"
                subtitle="Contacta con nuestro equipo"
                onPress={onSupport}
                colors={colors}
              />

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Additional Options */}
            <MenuItem
              icon="star.fill"
              title="Configuración"
              subtitle="Personaliza tu experiencia"
              onPress={() => {}}
              colors={colors}
            />
            {/* Theme Toggle */}
            <View style={[styles.menuItem, { marginHorizontal: 10, marginVertical: 4 }]}>
              <View style={[styles.menuItemIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <IconSymbol name={isDark ? 'star.fill' : 'star'} size={24} color={colors.accent.blue} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>Tema oscuro</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.secondary }]}>Cambia entre claro y oscuro</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                trackColor={{ false: '#bbb', true: colors.accent.blue + '55' }}
                thumbColor={isDark ? colors.accent.blue : '#f4f3f4'}
              />
            </View>
            
            <MenuItem
              icon="checkmark"
              title="Acerca de"
              subtitle="Información de la aplicación"
              onPress={() => {}}
              colors={colors}
            />
            </ScrollView>

            {/* Footer */}
            <View style={styles.menuFooter}>
              <Text style={[styles.footerText, { color: colors.secondary }]}>
                Versión 1.0.0
              </Text>
              <Text style={[styles.footerText, { color: colors.secondary }]}>
                © 2024 HILCO
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    maxWidth: 320,
  },
  menuGradient: {
    flex: 1,
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
  },
});