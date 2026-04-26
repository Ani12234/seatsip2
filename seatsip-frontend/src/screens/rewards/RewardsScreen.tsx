import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg: '#F5F0EB',
  surface: '#FDFAF6',
  primary: '#3D2B1F',
  accent: '#C8382A',
  gold: '#C8851A',
  goldBg: '#FEF0D6',
  greenBg: '#E8F5E9',
  greenTxt: '#22863A',
  border: '#EDE0CC',
  muted: '#9E9E9E',
  cream: '#FFF8F0',
};

// ─── Tier Config ─────────────────────────────────────────────────────────────

const TIERS = [
  { name: 'Bronze', emoji: '🥉', min: 0,    max: 499,  color: '#CD7F32', bg: '#FDF0E8' },
  { name: 'Silver', emoji: '🥈', min: 500,  max: 1499, color: '#A8A9AD', bg: '#F4F4F4' },
  { name: 'Gold',   emoji: '🥇', min: 1500, max: 2999, color: '#C8851A', bg: '#FEF0D6' },
  { name: 'Plat',   emoji: '💎', min: 3000, max: 99999, color: '#6A5ACD', bg: '#EDEBFA' },
];

function getTier(pts: number) {
  return TIERS.find(t => pts >= t.min && pts <= t.max) ?? TIERS[0];
}

function getNextTier(pts: number) {
  const idx = TIERS.findIndex(t => pts >= t.min && pts <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_POINTS = 820;

const HISTORY = [
  { id: '1', desc: 'Order at Dyu Art Café',       pts: +120, date: '24 Apr' },
  { id: '2', desc: 'Reservation bonus',            pts: +50,  date: '22 Apr' },
  { id: '3', desc: 'Redeemed – Free Cappuccino',   pts: -200, date: '20 Apr' },
  { id: '4', desc: 'Order at Third Wave Coffee',   pts: +90,  date: '18 Apr' },
  { id: '5', desc: 'Birthday bonus 🎂',            pts: +100, date: '15 Apr' },
  { id: '6', desc: 'Redeemed – 10% off coupon',   pts: -150, date: '10 Apr' },
];

const VOUCHERS = [
  { id: 'v1', title: 'Free Cappuccino',   cost: 200, emoji: '☕', desc: 'Valid at any partner café'       },
  { id: 'v2', title: '₹50 Off Order',     cost: 150, emoji: '🎟', desc: 'Min. order ₹300'                 },
  { id: 'v3', title: '10% Off Bill',      cost: 300, emoji: '💸', desc: 'Dine-in only'                    },
  { id: 'v4', title: 'Free Pastry',       cost: 180, emoji: '🥐', desc: 'Paired with any hot beverage'    },
  { id: 'v5', title: 'Priority Seating',  cost: 100, emoji: '🪑', desc: 'Skip the queue for 1 visit'      },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function TierBadge({ pts }: { pts: number }) {
  const tier = getTier(pts);
  const next = getNextTier(pts);
  const progress = next ? (pts - tier.min) / (next.min - tier.min) : 1;

  return (
    <View style={[tb.card, { backgroundColor: tier.bg, borderColor: tier.color + '44' }]}>
      <View style={tb.topRow}>
        <Text style={tb.emoji}>{tier.emoji}</Text>
        <View>
          <Text style={[tb.tierName, { color: tier.color }]}>{tier.name} Member</Text>
          <Text style={tb.pts}>{pts.toLocaleString()} pts</Text>
        </View>
        {next && (
          <View style={tb.nextWrap}>
            <Text style={tb.nextLabel}>Next: {next.emoji} {next.name}</Text>
            <Text style={[tb.nextPts, { color: tier.color }]}>{(next.min - pts)} pts away</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={tb.barBg}>
        <View style={[tb.barFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: tier.color }]} />
      </View>
      <View style={tb.barLabels}>
        <Text style={tb.barLabel}>{tier.min}</Text>
        {next && <Text style={tb.barLabel}>{next.min}</Text>}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, marginHorizontal: 20, marginBottom: 20, borderWidth: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  emoji: { fontSize: 40 },
  tierName: { fontSize: 18, fontWeight: '800' },
  pts: { fontSize: 13, color: T.muted, marginTop: 2 },
  nextWrap: { marginLeft: 'auto', alignItems: 'flex-end' },
  nextLabel: { fontSize: 11, color: T.muted },
  nextPts: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  barBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { fontSize: 10, color: T.muted },
});

function VoucherCard({ v, pts, onRedeem }: { v: typeof VOUCHERS[0]; pts: number; onRedeem: (v: typeof VOUCHERS[0]) => void }) {
  const canAfford = pts >= v.cost;
  return (
    <View style={[vc.card, !canAfford && vc.disabled]}>
      <Text style={vc.emoji}>{v.emoji}</Text>
      <View style={vc.info}>
        <Text style={vc.title}>{v.title}</Text>
        <Text style={vc.desc}>{v.desc}</Text>
      </View>
      <View style={vc.right}>
        <Text style={[vc.cost, { color: canAfford ? T.gold : T.muted }]}>{v.cost} pts</Text>
        <TouchableOpacity
          style={[vc.btn, { backgroundColor: canAfford ? T.accent : '#E0D8CC' }]}
          onPress={() => canAfford && onRedeem(v)}
          activeOpacity={canAfford ? 0.8 : 1}
        >
          <Text style={[vc.btnTxt, { color: canAfford ? '#fff' : T.muted }]}>
            {canAfford ? 'Redeem' : 'Need more'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const vc = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: T.border,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  disabled: { opacity: 0.6 },
  emoji: { fontSize: 28, width: 36 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: T.primary },
  desc: { fontSize: 11, color: T.muted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  cost: { fontSize: 13, fontWeight: '700' },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnTxt: { fontSize: 11, fontWeight: '700' },
});

function HistoryRow({ h }: { h: typeof HISTORY[0] }) {
  const isEarn = h.pts > 0;
  return (
    <View style={hr.row}>
      <View style={[hr.dot, { backgroundColor: isEarn ? T.greenTxt : T.accent }]} />
      <View style={hr.middle}>
        <Text style={hr.desc}>{h.desc}</Text>
        <Text style={hr.date}>{h.date}</Text>
      </View>
      <Text style={[hr.pts, { color: isEarn ? T.greenTxt : T.accent }]}>
        {isEarn ? '+' : ''}{h.pts}
      </Text>
    </View>
  );
}

const hr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  dot: { width: 10, height: 10, borderRadius: 5 },
  middle: { flex: 1 },
  desc: { fontSize: 13, fontWeight: '600', color: T.primary },
  date: { fontSize: 11, color: T.muted, marginTop: 2 },
  pts: { fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

type Tab = 'vouchers' | 'history';

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('vouchers');
  const [points, setPoints] = useState(MOCK_POINTS);
  const tier = getTier(points);

  const handleRedeem = (v: typeof VOUCHERS[0]) => {
    if (points >= v.cost) {
      setPoints(p => p - v.cost);
      alert(`🎉 "${v.title}" redeemed! Check your wallet for the coupon.`);
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>☕ SeatSip Rewards</Text>
          <Text style={s.headerSub}>Earn points with every sip & seat</Text>
        </View>
        <View style={[s.pointsPill, { borderColor: tier.color + '66', backgroundColor: tier.bg }]}>
          <Text style={[s.pointsNum, { color: tier.color }]}>{points}</Text>
          <Text style={[s.pointsLabel, { color: tier.color }]}>pts</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* ── Tier Card ── */}
        <TierBadge pts={points} />

        {/* ── How to Earn ── */}
        <View style={s.earnRow}>
          {[
            { emoji: '🛒', pts: '+10', label: 'Per ₹100 spent' },
            { emoji: '🪑', pts: '+50', label: 'Reservation' },
            { emoji: '⭐', pts: '+30', label: 'Write review' },
            { emoji: '👥', pts: '+100', label: 'Refer friend' },
          ].map(e => (
            <View key={e.label} style={s.earnCard}>
              <Text style={s.earnEmoji}>{e.emoji}</Text>
              <Text style={[s.earnPts, { color: T.gold }]}>{e.pts}</Text>
              <Text style={s.earnLabel}>{e.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Tab Bar ── */}
        <View style={s.tabBar}>
          {(['vouchers', 'history'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, tab === t && s.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                {t === 'vouchers' ? '🎟 Vouchers' : '📋 History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Vouchers ── */}
        {tab === 'vouchers' && (
          <View style={s.listWrap}>
            <Text style={s.sectionNote}>You have <Text style={{ fontWeight: '800', color: T.gold }}>{points} pts</Text> to spend</Text>
            {VOUCHERS.map(v => (
              <VoucherCard key={v.id} v={v} pts={points} onRedeem={handleRedeem} />
            ))}
          </View>
        )}

        {/* ── History ── */}
        {tab === 'history' && (
          <View style={s.listWrap}>
            {HISTORY.map(h => <HistoryRow key={h.id} h={h} />)}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.primary },
  headerSub: { fontSize: 12, color: T.muted, marginTop: 2 },
  pointsPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  pointsNum: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  pointsLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  // Earn cards
  earnRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  earnCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: T.border,
  },
  earnEmoji: { fontSize: 22 },
  earnPts: { fontSize: 14, fontWeight: '800' },
  earnLabel: { fontSize: 9, color: T.muted, textAlign: 'center', lineHeight: 13 },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#ECE4D4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#fff' },
  tabTxt: { fontSize: 13, fontWeight: '600', color: T.muted },
  tabTxtActive: { color: T.primary, fontWeight: '800' },

  // Lists
  listWrap: { paddingHorizontal: 20 },
  sectionNote: { fontSize: 13, color: T.muted, marginBottom: 12 },
});
