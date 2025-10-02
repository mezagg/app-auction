import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auctionService } from '@/services/auctionService';
import { AnimatedAuctionCard } from '@/components/AnimatedAuctionCard';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { FilterTabs, FilterType } from '@/components/FilterTabs';
import { HamburgerMenu } from '@/components/HamburgerMenu';

type Auction = {
  auction_id: string;
  title: string;
  description: string;
  reason: string;
  company_name: string;
  start_date: string;
  end_date: string;
  status: 'proxima' | 'activa' | 'finalizada';
  location: string;
  state: string;
  total_items: number;
  registration_fee: number;
};

export default function AuctionsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Animation values for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(120)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const showText = useRef(new Animated.Value(0)).current;

  const loadAuctions = async () => {
    try {
      const data = await auctionService.getAuctions();
      setAuctions(data);
      filterAuctions(data, activeFilter);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las subastas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterAuctions = (auctionData: Auction[], filter: FilterType) => {
    let filtered = auctionData;
    
    switch (filter) {
      case 'proximas':
        filtered = auctionData.filter(auction => auction.status === 'proxima');
        break;
      case 'anteriores':
        filtered = auctionData.filter(auction => auction.status === 'finalizada');
        break;
      case 'negociadas':
        filtered = auctionData.filter(auction => 
          auction.reason === 'venta_negociada' || 
          auction.reason.toLowerCase().includes('negociad')
        );
        break;
      case 'todas':
      default:
        filtered = auctionData;
        break;
    }
    
    setFilteredAuctions(filtered);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterAuctions(auctions, filter);
  };

  // Scroll handler for header animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        
        // Animate header elements based on scroll
        if (offsetY > 50) {
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(showText, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(showText, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }
  );

  // Menu handlers
  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const handleLogin = () => {
    setIsMenuVisible(false);
    Alert.alert('Login', 'Función de login próximamente');
  };

  const handleFAQ = () => {
    setIsMenuVisible(false);
    Alert.alert('FAQ', 'Preguntas frecuentes próximamente');
  };

  const handleSupport = () => {
    setIsMenuVisible(false);
    Alert.alert('Soporte', 'Contacto de soporte próximamente');
  };

  const handleMessages = () => {
    Alert.alert('Mensajes', 'Bandeja de mensajes próximamente');
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAuctions().finally(() => setRefreshing(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return colors.success; // Green
      case 'proxima':
        return colors.primary; // Primary blue
      case 'finalizada':
        return colors.secondary; // Gray
      default:
        return colors.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activa':
        return 'EN VIVO';
      case 'proxima':
        return 'PRÓXIMA';
      case 'finalizada':
        return 'FINALIZADA';
      default:
        return status.toUpperCase();
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'cierre_empresa':
        return 'Cierre de Empresa';
      case 'renovacion_flotilla':
        return 'Renovación de Flota';
      default:
        return reason;
    }
  };
  
  const getAuctionImage = (reason: string) => {
    switch (reason) {
      case 'cierre_empresa':
        return require('@/assets/images/auction-business.jpg');
      case 'renovacion_flotilla':
        return require('@/assets/images/auction-vehicles.jpg');
      default:
        return require('@/assets/images/auction-default.jpg');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const renderAuction = ({ item }: { item: Auction }) => (
    <TouchableOpacity
      style={[styles.auctionCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push(`/auction-detail/${item.auction_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={[styles.auctionTitle, { color: colors.text }]} numberOfLines={2}>
          {getReasonText(item.reason)}
        </Text>
      </View>
      
      {/* Muestra el título de la subasta, limitado a 2 líneas 
      <Text style={[styles.auctionTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title} 
      </Text>*/}
      
      <Text style={[styles.companyName, { color: colors.tint }]}>
        {item.company_name}
      </Text>
      
      <View style={styles.infoRow}>
        <IconSymbol name="location" size={16} color={colors.icon} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {item.location}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="calendar" size={16} color={colors.icon} />
        <Text style={[styles.dateText, { color: colors.text }]}>
          {item.status === 'activa' 
            ? `Termina: ${formatDate(item.end_date)}`
            : `Inicia: ${formatDate(item.start_date)}`
          }
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={[styles.itemCount, { color: colors.tint }]}>
            {item.total_items} artículos
          </Text>
        </View>
        <Text style={[styles.registrationFee, { color: colors.text }]}>
          Inscripción: ${item.registration_fee.toLocaleString('es-MX')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando subastas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.headerContent}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuToggle}
            activeOpacity={0.7}
          >
            <View style={[styles.hamburgerLine, { backgroundColor: colors.white }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.white }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.white }]} />
          </TouchableOpacity>

          {/* Logo and Text Container */}
          <View style={styles.centerContent}>
            <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
              <Image
                source={require('@/assets/images/logo-bco.svg')}
                style={styles.logo}
                contentFit="contain"
              />
            </Animated.View>
            
            <Animated.View style={[styles.textContainer, { opacity: showText }]}>
              <Text style={[styles.headerTitle, { color: colors.white }]}>
                Subastas HILCO GLOBAL MX
              </Text>
            </Animated.View>
          </View>

          {/* Messages Button */}
          <TouchableOpacity
            style={styles.messagesButton}
            onPress={handleMessages}
            activeOpacity={0.7}
          >
            <IconSymbol name="heart" size={24} color={colors.white} />
            <View style={[styles.messageBadge, { backgroundColor: colors.accent.red }]}>
              <Text style={styles.messageBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <FlashList
        data={filteredAuctions}
        renderItem={({ item, index }) => (
          <AnimatedAuctionCard 
            item={{
              id: item.auction_id,
              title: "Subasta Multimarcas",
              description: item.description,
              start_date: "9 de octubre 2025",
              end_date: item.end_date,
              status: item.status,
              reason: item.reason,
              location: item.location,
              category: item.reason, // Using reason as category for now
              registration_fee: item.registration_fee,
              image_url: undefined, // No image URL in current data structure
              lots_count: item.total_items || 404 // Using total_items as lots_count, default to 404
            }} 
            index={index} 
          />
        )}
        keyExtractor={(item) => item.auction_id}
        ListHeaderComponent={() => (
          <View>
            <FeaturedCarousel />
            <FilterTabs 
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Hamburger Menu */}
      <HamburgerMenu
        isVisible={isMenuVisible}
        onClose={handleMenuClose}
        onLogin={handleLogin}
        onFAQ={handleFAQ}
        onSupport={handleSupport}
      />
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    marginVertical: 2,
    borderRadius: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 120,
    height: 40,
    marginRight: 12,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
  },
  auctionCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  auctionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  itemCount: {
    fontSize: 15,
    fontWeight: '600',
  },
  registrationFee: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardBackground: {
    flex: 1,
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
  cardDetails: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '500',
  },
});