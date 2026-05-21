import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
} from 'react-native';
import Svg, { Path, Polygon, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/ui/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const BROWN = '#6D3914';
const ACCENT = '#8B5E3C';
const BG = '#F5F0EB';

const MIN_POINTS = 0;
const MAX_TIER_POINTS = 2000;

const WAYS_TO_EARN = [
  { id: '1', icon: '🛒', label: 'Per ₹100 spent',   pts: '+10 pts' },
  { id: '2', icon: '🪑', label: 'Per Reservation',  pts: '+50 pts' },
  { id: '3', icon: '⭐', label: 'Write a review',   pts: '+30 pts' },
  { id: '4', icon: '👥', label: 'Refer a friend',   pts: '+100 pts' },
];

// ─── Tier Config ──────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: 'platinum',
    name: 'CREAM',
    tag: 'BEST VALUE',
    description: 'Unlock all benefits',
    bg: '#E4CDB0',
    text: '#3F1D0E',
    subtext: '#7A5035',
    tagBg: '#3F1D0E',
    divider: 'rgba(63,29,14,0.2)',
    iconBg: 'rgba(63,29,14,0.1)',
    hexFill: '#E4CDB0',
    hexStroke: '#A2663C',
    shadow: '#A2663C',
    benefits: [
      { icon: 'star', label: '5% Extra\npoints' },
      { icon: 'support', label: 'Priority\nsupport' },
      { icon: 'tag', label: 'Exclusive\noffers' },
      { icon: 'time', label: 'Early\naccess' },
      { icon: 'delivery', label: 'Free\ndelivery' },
    ],
  },
  {
    id: 'gold',
    name: 'CARAMEL',
    tag: 'MOST POPULAR',
    description: 'More benefits, more rewards',
    bg: '#A2663C',
    text: '#FFFFFF',
    subtext: '#E4CDB0',
    tagBg: '#3F1D0E',
    divider: 'rgba(228,205,176,0.3)',
    iconBg: 'rgba(255,255,255,0.12)',
    hexFill: '#A2663C',
    hexStroke: '#E4CDB0',
    shadow: '#3F1D0E',
    benefits: [
      { icon: 'star', label: '3% Extra\npoints' },
      { icon: 'support', label: 'Priority\nsupport' },
      { icon: 'tag', label: 'Exclusive\noffers' },
      { icon: 'time', label: 'Early\naccess' },
    ],
  },
  {
    id: 'silver',
    name: 'COFFEE',
    tag: null,
    description: 'Great rewards to get you started',
    bg: '#3F1D0E',
    text: '#E4CDB0',
    subtext: '#A2663C',
    tagBg: '#A2663C',
    divider: 'rgba(228,205,176,0.15)',
    iconBg: 'rgba(228,205,176,0.1)',
    hexFill: '#3F1D0E',
    hexStroke: '#A2663C',
    shadow: '#000000',
    benefits: [
      { icon: 'star', label: '1% Extra\npoints' },
      { icon: 'support', label: 'Standard\nsupport' },
      { icon: 'tag', label: 'Member\noffers' },
      { icon: 'time', label: 'Early\naccess' },
    ],
  },
];

// ─── Benefit Icon ─────────────────────────────────────────────────────────────
const BenefitItem = ({ icon, label, iconBg, textColor }: { icon: string; label: string; iconBg: string; textColor: string }) => (
  <View style={tierStyles.benefitItem}>
    <View style={[tierStyles.benefitIconCircle, { backgroundColor: iconBg }]}>
      <AppIcon name={icon === 'support' ? 'bell' : icon === 'tag' ? 'bookmark' : icon} size={18} color={textColor} />
    </View>
    <Text style={[tierStyles.benefitLabel, { color: textColor }]}>{label}</Text>
  </View>
);

// ─── Hex Icon ─────────────────────────────────────────────────────────────────
const HexIcon = ({ fill, stroke }: { fill: string; stroke: string }) => (
  <Svg width={42} height={46} viewBox="0 0 52 56">
    <Polygon
      points="26,2 50,15 50,41 26,54 2,41 2,15"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
    <Polygon
      points="26,9 44,19 44,37 26,47 8,37 8,19"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1"
    />
    <Circle cx="26" cy="28" r="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
  </Svg>
);

// ─── Tier Card ────────────────────────────────────────────────────────────────
const TierCardItem = ({ tier, isCurrentTier }: { tier: typeof TIERS[0]; isCurrentTier: boolean }) => (
  <View style={[
    tierStyles.card,
    { backgroundColor: tier.bg, shadowColor: tier.shadow },
    isCurrentTier && { borderWidth: 2, borderColor: tier.hexStroke },
  ]}>
    <View style={tierStyles.cardInner}>
      {/* Left: Icon + Info */}
      <View style={tierStyles.leftCol}>
        <HexIcon fill={tier.hexFill} stroke={tier.hexStroke} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          {tier.tag && (
            <View style={[tierStyles.tagBadge, { backgroundColor: tier.tagBg }]}>
              <AppIcon name="popular" size={11} color="#FFF" fill="#FFF" />
              <Text style={tierStyles.tagText} numberOfLines={1}>{tier.tag}</Text>
            </View>
          )}
          <Text style={[tierStyles.tierName, { color: tier.text }]}>{tier.name}</Text>
          <Text style={[tierStyles.tierDesc, { color: tier.subtext }]}>{tier.description}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[tierStyles.divider, { backgroundColor: tier.divider }]} />

      {/* Right: Benefits */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tierStyles.benefitsList}
      >
        {tier.benefits.map((b, i) => (
          <BenefitItem key={i} icon={b.icon} label={b.label} iconBg={tier.iconBg} textColor={tier.text} />
        ))}
      </ScrollView>
    </View>
  </View>
);

const tierStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 90,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 155,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 4,
    gap: 3,
    flexWrap: 'nowrap',
    flexShrink: 0,
  },
  tagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tierName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  tierDesc: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
  },
  divider: {
    width: 1,
    height: 56,
    marginHorizontal: 12,
    borderRadius: 1,
  },
  benefitsList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingRight: 6,
  },
  benefitItem: { alignItems: 'center', minWidth: 50 },
  benefitIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  benefitLabel: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
});

// ─── Coin Badge ───────────────────────────────────────────────────────────────
const CoinBadge = () => (
  <View style={styles.coinOuter}>
    <View style={styles.coinInner}>
      <Image 
        source={require('../../assets/images/coin_logo.png')} 
        style={styles.coinLogo} 
        resizeMode="contain" 
      />
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
  const { user, refreshUser } = useAuth();
  const points = user?.loyalty_points ?? 0;
  const progress = useMemo(() => {
    const span = Math.max(1, MAX_TIER_POINTS - MIN_POINTS);
    return Math.min(1, Math.max(0, (points - MIN_POINTS) / span));
  }, [points]);
  const ptsToNext = Math.max(0, MAX_TIER_POINTS - points);
  const [activity, setActivity] = useState<{ id: string; title: string; subtitle: string; amount: string }[]>([]);

  useEffect(() => {
    refreshUser();
    usersApi
      .walletTransactions()
      .then((r) => {
        const rows = (r.data?.data || []) as { id: string; description?: string; type?: string; amount?: number; created_at?: string }[];
        setActivity(
          rows.slice(0, 20).map((row) => ({
            id: row.id,
            title: row.description || row.type || 'Activity',
            subtitle: row.created_at ? new Date(row.created_at).toLocaleString() : '',
            amount:
              row.type === 'TOPUP' || row.type === 'REFUND'
                ? `+₹${Math.abs(Number(row.amount) || 0).toFixed(0)}`
                : `-₹${Math.abs(Number(row.amount) || 0).toFixed(0)}`,
          }))
        );
      })
      .catch(() => setActivity([]));
  }, [refreshUser]);

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

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
              <Text style={styles.balanceAmount}>{points}</Text>
              <Text style={styles.balanceUnit}>Points</Text>
            </View>

            <CoinBadge />
          </View>

          {/* ── Membership Tiers ── */}
          <Text style={styles.sectionTitle}>Membership Tiers</Text>
          {TIERS.map((tier) => (
            <TierCardItem
              key={tier.id}
              tier={tier}
              isCurrentTier={
                tier.id === 'platinum' ? points >= 4000 :
                tier.id === 'gold' ? points >= 2000 :
                true
              }
            />
          ))}

          {/* ── Ways to Earn ── */}
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <View style={styles.earnCard}>
            {activity.length === 0 ? (
              <Text style={styles.emptyActivity}>No wallet activity yet. Orders and top-ups show here.</Text>
            ) : (
              activity.map((row, index) => (
                <View
                  key={row.id}
                  style={[styles.activityRow, index < activity.length - 1 && styles.earnRowBorder]}
                >
                  <View style={styles.activityText}>
                    <Text style={styles.earnLabel}>{row.title}</Text>
                    <Text style={styles.earnPts}>{row.subtitle}</Text>
                  </View>
                  <Text style={styles.activityAmt}>{row.amount}</Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Ways to Earn</Text>

          <View style={styles.earnCard}>
            {WAYS_TO_EARN.map((item, index) => (
              <EarnRow key={item.id} item={item} isLast={index === WAYS_TO_EARN.length - 1} />
            ))}
          </View>

          {/* ── CTA Button ── */}
          <TouchableOpacity 
            style={styles.ctaBtn} 
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('AllRewards')}
          >
            <AppIcon name="rewards" size={18} color="#fff" />
            <Text style={styles.ctaText}>View All Rewards</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  safeArea: {
    flex: 1,
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

  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, width: '100%' },

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
    backgroundColor: '#2A1703',
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
    backgroundColor: '#2A1703',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5A3218',
  },
  coinLogo: {
    width: 90,
    height: 90,
  },

  // Tier card
  tierCard: {
    backgroundColor: '#FAF3E8',
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
    backgroundColor: '#FAF3E8',
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
  emptyActivity: {
    padding: 20,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  activityText: { flex: 1, marginRight: 12 },
  activityAmt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
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
