import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Auction {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
  location: string;
  category: string;
  registration_fee: number;
  image_url?: string;
  lots_count: number; // Nuevo campo para número de lotes
}

interface AnimatedAuctionCardProps {
  item: Auction;
  index: number;
}

export const AnimatedAuctionCard: React.FC<AnimatedAuctionCardProps> = ({ item, index }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'activa': colors.activeAuction,
      'próxima': colors.upcomingAuction,
      'finalizada': colors.endedAuction,
      'active': colors.activeAuction,
      'upcoming': colors.upcomingAuction,
      'finished': colors.endedAuction,
    };
    return statusMap[status.toLowerCase()] || colors.accent.blue;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'activa': 'ACTIVA',
      'próxima': 'PRÓXIMA',
      'finalizada': 'FINALIZADA',
      'active': 'ACTIVA',
      'upcoming': 'PRÓXIMA',
      'finished': 'FINALIZADA',
    };
    return statusMap[status.toLowerCase()] || status.toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'inmuebles': '#26B4E4',
      'vehículos': '#26B4E4',
      'real_estate': '#26B4E4',
      'vehicles': '#26B4E4',
      'maquinaria': '#26B4E4',
      'machinery': '#26B4E4',
    };
    return categoryMap[category.toLowerCase()] || '#26B4E4';
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('vehículo') || categoryLower.includes('vehicle') || categoryLower.includes('auto')) {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="white"/>
        </Svg>
      );
    }
    
    if (categoryLower.includes('inmueble') || categoryLower.includes('real_estate') || categoryLower.includes('casa')) {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="white"/>
        </Svg>
      );
    }
    
    // Ícono general por defecto
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="7" height="7" rx="2" fill="white" stroke="white" strokeWidth="1"/>
        <Rect x="14" y="3" width="7" height="7" rx="2" fill="white" stroke="white" strokeWidth="1"/>
        <Rect x="3" y="14" width="7" height="7" rx="2" fill="white" stroke="white" strokeWidth="1"/>
        <Rect x="14" y="14" width="7" height="7" rx="2" fill="white" stroke="white" strokeWidth="1"/>
      </Svg>
    );
  };

  const getAuctionImage = (category: string, reason: string = '') => {
    // Use real images from the provided URLs based on category/reason
    const imageUrls = [
      'https://prod.subastashilcoacetec.mx/Subastas/BIENES/43408/IMG_20250625_181020.jpg',
      'https://prod.subastashilcoacetec.mx/Subastas/BIENES/42845/1.jpg',
      'https://prod.subastashilcoacetec.mx/Subastas/BIENES/41755/IMG_20250322_135930356_HDR.jpg',
      'https://prod.subastashilcoacetec.mx/Subastas/BIENES/38622/IMG_20241127_155530.jpg',
    ];
    
    // Assign images based on category or use a random one
    switch (category) {
      case 'cierre_empresa':
        return imageUrls[0];
      case 'renovacion_flotilla':
        return imageUrls[1];
      case 'venta_negociada':
        return imageUrls[2];
      default:
        // Use a hash of the reason to consistently assign images
        const hash = reason.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return imageUrls[Math.abs(hash) % imageUrls.length];
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'judicial': 'Judicial',
      'administrative': 'Administrativa',
      'voluntary': 'Voluntaria',
      'bankruptcy': 'Concurso',
    };
    return reasonMap[reason] || reason;
  };

  const getLotsImage = (index: number) => {
    const images = [
      require('@/assets/images/lotes/20250507_161917.jpg'),
      require('@/assets/images/lotes/IMG_20240712_110157.jpg'),
      require('@/assets/images/lotes/IMG_20241121_153844.jpg'),
      require('@/assets/images/lotes/IMG_20250322_135930356_HDR.jpg'),
      require('@/assets/images/lotes/buick 12.jpg'),
    ];
    return images[index % images.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/auction-detail/${item.id}`);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        {/* Neumorphic Card Design */}
        <View style={[styles.neumorphicCard, { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.shadowDark,
        }]}>
          {/* Auction Title and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: '#26B4E4' }]}>
                {getCategoryIcon(item.category)}
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryText, { color: colors.text }]}>
                  {item.category.toUpperCase()}
                </Text>
                {item.reason && (
                  <Text style={[styles.reasonText, { color: colors.secondary }]}>
                    {item.reason}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          {/* Layout horizontal: Imagen cuadrada + Contenido */}
          <View style={styles.cardBody}>
            {/* Imagen cuadrada con label de lotes */}
            <View style={styles.imageContainer}>
              <Image
                source={getLotsImage(index)}
                style={styles.squareImage}
                contentFit="cover"
              />
              <View style={[styles.lotsLabel, { backgroundColor: '#FF4444' }]}>
                <Text style={styles.lotsText}>{item.lots_count} lotes</Text>
              </View>
            </View>

            {/* Contenido a la derecha */}
            <View style={styles.contentContainer}>
              {/* Información de fecha */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={[styles.infoText, { color: colors.secondary }]}>
                    {item.start_date}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Bar for Active Auctions */}
          {item.status.toLowerCase() === 'activa' && (
            <View style={styles.progressSection}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: getStatusColor(item.status),
                    width: '65%' // Mock progress
                  }
                ]} />
              </View>
              <Text style={[styles.progressText, { color: colors.secondary }]}>
                65% del tiempo transcurrido
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  cardContent: {
    flex: 1,
  },
  neumorphicCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  feeSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressSection: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  squareImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  lotsLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  lotsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});