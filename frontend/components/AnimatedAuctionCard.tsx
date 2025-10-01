import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
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
      'inmuebles': colors.realEstateAuction,
      'vehículos': colors.vehicleAuction,
      'real_estate': colors.realEstateAuction,
      'vehicles': colors.vehicleAuction,
      'maquinaria': colors.accent.orange,
      'machinery': colors.accent.orange,
    };
    return categoryMap[category.toLowerCase()] || colors.accent.purple;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'inmuebles': '🏠',
      'vehículos': '🚗',
      'real_estate': '🏠',
      'vehicles': '🚗',
      'maquinaria': '⚙️',
      'machinery': '⚙️',
    };
    return iconMap[category.toLowerCase()] || '📦';
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
          {/* Category Icon and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
                <Text style={styles.categoryEmoji}>{getCategoryIcon(item.category)}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryText, { color: colors.text }]}>
                  {item.category.toUpperCase()}
                </Text>
                <Text style={[styles.reasonText, { color: colors.secondary }]}>
                  {getReasonText(item.reason || '')}
                </Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Location and Date Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={[styles.infoText, { color: colors.secondary }]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={[styles.infoText, { color: colors.secondary }]}>
                {item.status.toLowerCase() === 'activa' 
                  ? `Termina: ${formatDate(item.end_date)}`
                  : `Inicia: ${formatDate(item.start_date)}`
                }
              </Text>
            </View>
          </View>

          {/* Registration Fee - Large Number */}
          <View style={[styles.feeSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.feeLabel, { color: colors.secondary }]}>
              INSCRIPCIÓN
            </Text>
            <Text style={[styles.feeAmount, { color: getStatusColor(item.status) }]}>
              {formatCurrency(item.registration_fee)}
            </Text>
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
});