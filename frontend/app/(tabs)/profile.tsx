import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { userService, authService, User } from '@/services/auctionService';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const loadUserProfile = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (error) {
      console.log('User not logged in');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await authService.login({ email, password });
      await loadUserProfile();
      setShowLoginModal(false);
      clearForm();
      Alert.alert('Éxito', 'Has iniciado sesión correctamente');
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        email,
        full_name: fullName,
        phone,
        company: company || undefined,
        password,
      });
      await loadUserProfile();
      setShowLoginModal(false);
      clearForm();
      Alert.alert('Éxito', 'Te has registrado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            authService.logout();
            setUser(null);
            Alert.alert('Éxito', 'Has cerrado sesión correctamente');
          },
        },
      ]
    );
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCompany('');
  };

  const openAuthModal = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setShowLoginModal(true);
    clearForm();
  };

  if (loading && user === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Logged out state
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Mi Perfil
          </Text>
        </View>

        <View style={styles.centerContainer}>
          <IconSymbol name="person.fill" size={64} color={colors.icon} />
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            ¡Bienvenido a Subastas Elite!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.text }]}>
            Inicia sesión o crea una cuenta para participar en nuestras subastas exclusivas
          </Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.tint }]}
              onPress={() => openAuthModal(true)}
            >
              <Text style={styles.loginButtonText}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.registerButton, { borderColor: colors.tint }]}
              onPress={() => openAuthModal(false)}
            >
              <Text style={[styles.registerButtonText, { color: colors.tint }]}>
                Crear Cuenta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Modal */}
        <Modal
          visible={showLoginModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowLoginModal(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Registration fields */}
              {!isLogin && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Nombre Completo *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }
                      ]}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Tu nombre completo"
                      placeholderTextColor={colors.icon}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Teléfono *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }
                      ]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+52 123 456 7890"
                      placeholderTextColor={colors.icon}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Empresa (Opcional)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }
                      ]}
                      value={company}
                      onChangeText={setCompany}
                      placeholder="Nombre de tu empresa"
                      placeholderTextColor={colors.icon}
                    />
                  </View>
                </>
              )}

              {/* Email and Password for both */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu.email@ejemplo.com"
                  placeholderTextColor={colors.icon}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Contraseña *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={[styles.switchModeText, { color: colors.tint }]}>
                  {isLogin 
                    ? '¿No tienes cuenta? Crear una' 
                    : '¿Ya tienes cuenta? Iniciar sesión'
                  }
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Logged in state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mi Perfil
        </Text>
      </View>

      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {user.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.full_name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text }]}>
            {user.email}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Información Personal
          </Text>
          
          <View style={styles.infoRow}>
            <IconSymbol name="person.fill" size={20} color={colors.icon} />
            <Text style={[styles.infoLabel, { color: colors.text }]}>Nombre:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.full_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="star" size={20} color={colors.icon} />
            <Text style={[styles.infoLabel, { color: colors.text }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="star" size={20} color={colors.icon} />
            <Text style={[styles.infoLabel, { color: colors.text }]}>Teléfono:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.phone}</Text>
          </View>

          {user.company && (
            <View style={styles.infoRow}>
              <IconSymbol name="star" size={20} color={colors.icon} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Empresa:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.company}</Text>
            </View>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Estadísticas
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                {user.registered_auctions.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Subastas Registradas
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.danger }]}
          onPress={handleLogout}
        >
          <IconSymbol name="star" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  authButtons: {
    width: '100%',
    marginTop: 32,
  },
  loginButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  switchModeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Profile styles
  profileContent: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    flex: 2,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});