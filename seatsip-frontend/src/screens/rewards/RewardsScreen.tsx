import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/ui/AppIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const BROWN = '#2C1A0E';
const ACCENT = '#8B5E3C';
const BG = '#F5F0EB';

const CURRENT_POINTS = 820;
const MIN_POINTS = 500;
const MAX_POINTS = 1500;
const PROGRESS = (CURRENT_POINTS - MIN_POINTS) / (MAX_POINTS - MIN_POINTS); // 0–1

const WAYS_TO_EARN = [
  { id: '1', icon: '🛒', label: 'Per ₹100 spent',   pts: '+10 pts' },
  { id: '2', icon: '🪑', label: 'Per Reservation',  pts: '+50 pts' },
  { id: '3', icon: '⭐', label: 'Write a review',   pts: '+30 pts' },
  { id: '4', icon: '👥', label: 'Refer a friend',   pts: '+100 pts' },
];

// ─── Coin Badge ───────────────────────────────────────────────────────────────
const CoinBadge = () => (
  <View style={styles.coinOuter}>
    <View style={styles.coinInner}>
      <AppIcon name="points" size={36} color="#FFFFFF" fill="#FFFFFF" />
      <Text style={styles.coinTop}>SEATSIP</Text>
      <Text style={styles.coinBottom}>DIGITAL DETOX CAFE</Text>
    </View>
  </View>
);

// ─── Earn Row ─────────────────────────────────────────────────────────────────
const EarnRow = ({ item, isLast }: { item: any, isLast: boolean }) => (
  <TouchableOpacity
    style={[styles.earnRow, !isLast && styles.earnRowBorder]}
    activeOpacity={0.7}
  >
    <View style={styles.earnIconBox}>
      <AppIcon name={item.icon} size={20} color={ACCENT} />
    </View>
    <View style={styles.earnInfo}>
      <Text style={styles.earnLabel}>{item.label}</Text>
      <Text style={styles.earnPts}>{item.pts}</Text>
    </View>
    <AppIcon name="›" size={22} color="#CCCCCC" />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RewardsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Rewards</Text>
          <Text style={styles.headerSub}>Earn points & unlock exciting benefits</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          {/* Decorative rings */}
          <View style={styles.ringLarge} />
          <View style={styles.ringSmall} />

          <View style={styles.balanceLeft}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{CURRENT_POINTS}</Text>
            <Text style={styles.balanceUnit}>Points</Text>
          </View>

          <CoinBadge />
        </View>

        {/* ── Member Tier ── */}
        <View style={styles.tierCard}>
          <View style={styles.tierTop}>
            {/* Silver medal */}
            <View style={styles.medalWrap}>
              <View style={styles.medalRibbon}>
                <View style={[styles.ribbonStripe, { backgroundColor: '#C0392B' }]} />
                <View style={[styles.ribbonStripe, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.ribbonStripe, { backgroundColor: '#2980B9' }]} />
              </View>
              <View style={styles.medal}>
                <Text style={styles.medalNum}>2</Text>
              </View>
            </View>

            <Text style={styles.tierName}>Silver Member</Text>

            <View style={styles.tierNext}>
              <View style={styles.tierNextRow}><Text style={styles.tierNextLabel}>Next:</Text><AppIcon name="trending" size={13} color="#B8860B" /><Text style={styles.tierNextLabel}>Gold</Text></View>
              <Text style={styles.tierNextPts}>680 pts away</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${PROGRESS * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{MIN_POINTS}</Text>
            <Text style={styles.progressLabel}>{MAX_POINTS}</Text>
          </View>
        </View>

        {/* ── Ways to Earn ── */}
        <Text style={styles.sectionTitle}>Ways to Earn</Text>

        <View style={styles.earnCard}>
          {WAYS_TO_EARN.map((item, index) => (
            <EarnRow key={item.id} item={item} isLast={index === WAYS_TO_EARN.length - 1} />
          ))}
        </View>

        {/* ── CTA Button ── */}
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <AppIcon name="rewards" size={18} color="#fff" />
          <Text style={styles.ctaText}>View All Rewards</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  backIcon: { fontSize: 20, color: '#1A1A1A' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 13, color: '#888', marginTop: 1 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 },

  // Balance card
  balanceCard: {
    backgroundColor: BROWN,
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  ringLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 35,
    borderColor: 'rgba(255,255,255,0.04)',
    right: -60,
    bottom: -60,
  },
  ringSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 25,
    borderColor: 'rgba(255,255,255,0.04)',
    right: 30,
    top: -40,
  },
  balanceLeft: { flex: 1 },
  balanceLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 70,
  },
  balanceUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Coin
  coinOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4A2E14',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#6B3F1A',
  },
  coinInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#3A2010',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5A3218',
  },
  coinStar: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 40,
  },
  coinTop: {
    position: 'absolute',
    top: 14,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  coinBottom: {
    position: 'absolute',
    bottom: 14,
    fontSize: 5.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },

  // Tier card
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  medalWrap: { alignItems: 'center' },
  medalRibbon: {
    flexDirection: 'row',
    width: 20,
    height: 12,
    marginBottom: -4,
    overflow: 'hidden',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  ribbonStripe: { flex: 1, height: '100%' },
  medal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A0A0A0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medalNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#555',
  },
  tierName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  tierNext: { alignItems: 'flex-end' },
  tierNextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierNextLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  tierNextPts: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#EDEDED',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BROWN,
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },

  // Ways to Earn
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  earnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  earnRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  earnIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0EAE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnIcon: { fontSize: 20 },
  earnInfo: { flex: 1 },
  earnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  earnPts: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT,
  },
  chevron: {
    fontSize: 22,
    color: '#CCCCCC',
  },

  // CTA
  ctaBtn: {
    backgroundColor: BROWN,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: BROWN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaIcon: { fontSize: 20 },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
