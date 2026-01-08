import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Hardcoded Bitcoin data
const BITCOIN_PRICE = 91343;
const PRICE_CHANGE_24H = 2.34;
const PRICE_CHANGE_7D = 5.67;
const HIGH_24H = 92150;
const LOW_24H = 89200;
const MARKET_CAP = '1.81T';
const VOLUME_24H = '42.3B';

// Simulated chart data points (last 7 days)
const CHART_DATA = [
  { day: 'Mon', price: 86500 },
  { day: 'Tue', price: 87800 },
  { day: 'Wed', price: 89200 },
  { day: 'Thu', price: 88100 },
  { day: 'Fri', price: 90500 },
  { day: 'Sat', price: 89800 },
  { day: 'Sun', price: 91343 },
];

type TimeFrame = '24H' | '7D' | '30D' | '1Y' | 'ALL';

export default function BitcoinPriceScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('7D');

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const chartBg = colorScheme === 'dark' ? '#0d0d0d' : '#fafafa';

  const timeFrames: TimeFrame[] = ['24H', '7D', '30D', '1Y', 'ALL'];

  // Calculate chart dimensions
  const chartWidth = width - 40;
  const chartHeight = 200;
  const maxPrice = Math.max(...CHART_DATA.map(d => d.price));
  const minPrice = Math.min(...CHART_DATA.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  // Generate chart points
  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 40) - 20;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatLargeNumber = (num: string) => {
    return `$${num}`;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Bitcoin</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceHeader}>
              <View style={[styles.bitcoinIcon, { backgroundColor: '#f9731620' }]}>
                <MaterialCommunityIcons name="bitcoin" size={32} color="#f97316" />
              </View>
              <View style={styles.priceInfo}>
                <Text style={[styles.ticker, { color: secondaryText }]}>BTC</Text>
                <Text style={[styles.price, { color: textColor }]}>
                  {formatPrice(BITCOIN_PRICE)}
                </Text>
              </View>
            </View>
            
            <View style={styles.priceChangeContainer}>
              <View style={[styles.priceChangeBadge, { backgroundColor: '#10b98120' }]}>
                <MaterialCommunityIcons name="trending-up" size={16} color="#10b981" />
                <Text style={[styles.priceChangeText, { color: '#10b981' }]}>
                  +{PRICE_CHANGE_24H}% (24h)
                </Text>
              </View>
              <View style={[styles.priceChangeBadge, { backgroundColor: '#10b98120' }]}>
                <MaterialCommunityIcons name="trending-up" size={16} color="#10b981" />
                <Text style={[styles.priceChangeText, { color: '#10b981' }]}>
                  +{PRICE_CHANGE_7D}% (7d)
                </Text>
              </View>
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.chartSection}>
            {/* Time Frame Selector */}
            <View style={styles.timeFrameContainer}>
              {timeFrames.map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeFrameButton,
                    selectedTimeFrame === tf && styles.timeFrameButtonActive,
                    selectedTimeFrame === tf && { backgroundColor: '#f97316' },
                  ]}
                  onPress={() => setSelectedTimeFrame(tf)}
                >
                  <Text
                    style={[
                      styles.timeFrameText,
                      { color: selectedTimeFrame === tf ? '#fff' : secondaryText },
                    ]}
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chart */}
            <View style={[styles.chartContainer, { backgroundColor: chartBg, borderColor }]}>
              <View style={styles.chart}>
                {/* Chart gradient background */}
                <LinearGradient
                  colors={colorScheme === 'dark' 
                    ? ['rgba(249, 115, 22, 0.3)', 'rgba(249, 115, 22, 0)'] 
                    : ['rgba(249, 115, 22, 0.2)', 'rgba(249, 115, 22, 0)']}
                  style={styles.chartGradient}
                />
                
                {/* Chart line and points */}
                <View style={styles.chartLine}>
                  {CHART_DATA.map((point, index) => {
                    const x = (index / (CHART_DATA.length - 1)) * (chartWidth - 60) + 30;
                    const y = getY(point.price);
                    
                    return (
                      <View key={index} style={styles.chartPointContainer}>
                        {/* Connecting line to next point */}
                        {index < CHART_DATA.length - 1 && (
                          <View
                            style={[
                              styles.chartLineSegment,
                              {
                                left: x,
                                top: y,
                                width: (chartWidth - 60) / (CHART_DATA.length - 1),
                                transform: [
                                  {
                                    rotate: `${Math.atan2(
                                      getY(CHART_DATA[index + 1].price) - y,
                                      (chartWidth - 60) / (CHART_DATA.length - 1)
                                    )}rad`,
                                  },
                                ],
                              },
                            ]}
                          />
                        )}
                        
                        {/* Point */}
                        <View
                          style={[
                            styles.chartPoint,
                            {
                              left: x - 5,
                              top: y - 5,
                              backgroundColor: index === CHART_DATA.length - 1 ? '#f97316' : '#f9731680',
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>

                {/* X-axis labels */}
                <View style={styles.xAxisLabels}>
                  {CHART_DATA.map((point, index) => (
                    <Text key={index} style={[styles.xAxisLabel, { color: secondaryText }]}>
                      {point.day}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Market Stats
            </ThemedText>
            
            <View style={[styles.statsCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: secondaryText }]}>24h High</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{formatPrice(HIGH_24H)}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: secondaryText }]}>24h Low</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{formatPrice(LOW_24H)}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: secondaryText }]}>Market Cap</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{formatLargeNumber(MARKET_CAP)}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: secondaryText }]}>24h Volume</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{formatLargeNumber(VOLUME_24H)}</Text>
              </View>
            </View>
          </View>

          {/* Conversion Calculator */}
          <View style={styles.conversionSection}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Quick Convert
            </ThemedText>
            
            <View style={[styles.conversionCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.conversionRow}>
                <View style={styles.conversionLeft}>
                  <MaterialCommunityIcons name="bitcoin" size={24} color="#f97316" />
                  <Text style={[styles.conversionAmount, { color: textColor }]}>1 BTC</Text>
                </View>
                <Text style={[styles.conversionEquals, { color: secondaryText }]}>=</Text>
                <Text style={[styles.conversionResult, { color: textColor }]}>
                  {formatPrice(BITCOIN_PRICE)}
                </Text>
              </View>
              
              <View style={[styles.conversionDivider, { backgroundColor: borderColor }]} />
              
              <View style={styles.conversionRow}>
                <View style={styles.conversionLeft}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#eab308" />
                  <Text style={[styles.conversionAmount, { color: textColor }]}>100k sats</Text>
                </View>
                <Text style={[styles.conversionEquals, { color: secondaryText }]}>=</Text>
                <Text style={[styles.conversionResult, { color: textColor }]}>
                  {formatPrice(BITCOIN_PRICE / 1000)}
                </Text>
              </View>
              
              <View style={[styles.conversionDivider, { backgroundColor: borderColor }]} />
              
              <View style={styles.conversionRow}>
                <View style={styles.conversionLeft}>
                  <MaterialCommunityIcons name="cash" size={24} color="#10b981" />
                  <Text style={[styles.conversionAmount, { color: textColor }]}>$100</Text>
                </View>
                <Text style={[styles.conversionEquals, { color: secondaryText }]}>=</Text>
                <Text style={[styles.conversionResult, { color: textColor }]}>
                  {(100 / BITCOIN_PRICE * 100000000).toFixed(0)} sats
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  priceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  bitcoinIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInfo: {
    gap: 4,
  },
  ticker: {
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: 24,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeFrameButtonActive: {
    backgroundColor: '#f97316',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chart: {
    height: 220,
    position: 'relative',
  },
  chartGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
    bottom: 30,
  },
  chartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chartPointContainer: {
    position: 'absolute',
  },
  chartLineSegment: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#f97316',
    borderRadius: 1.5,
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  conversionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  conversionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  conversionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  conversionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversionEquals: {
    fontSize: 16,
    fontWeight: '500',
  },
  conversionResult: {
    fontSize: 16,
    fontWeight: '700',
  },
  conversionDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});

