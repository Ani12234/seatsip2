import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/ui/AppIcon';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    id: '1',
    type: 'VISA',
    last4: '4242',
    expiry: '12/27',
    isDefault: true,
    logo: 'visa',
  },
  {
    id: '2',
    type: 'MASTERCARD',
    last4: '8888',
    expiry: '09/26',
    isDefault: false,
    logo: 'mastercard',
  },
];

const TRANSACTIONS = [
  {
    id: '1',
    title: 'Added Money',
    date: 'Today, 10:30 AM',
    amount: '+₹500',
    positive: true,
    icon: '↓',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
  },
  {
    id: '2',
    title: 'Order #1234',
    date: 'Yesterday, 8:45 PM',
    amount: '-₹1,240',
    positive: false,
    icon: '↑',
    iconBg: '#FFEBEE',
    iconColor: '#C62828',
  },
  {
    id: '3',
    title: 'Cashback Earned',
    date: '22 Apr 2026, 6:20 PM',
    amount: '+₹45',
    positive: true,
    icon: '🎁',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    isEmoji: true,
  },
  {
    id: '4',
    title: 'Order #1230',
    date: '20 Apr 2026, 1:10 PM',
    amount: '-₹689',
    positive: false,
    icon: '↑',
    iconBg: '#FFEBEE',
    iconColor: '#C62828',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const VisaLogo = () => (
  <View style={styles.visaLogo}>
    <Text style={styles.visaText}>VISA</Text>
  </View>
);

const MastercardLogo = () => (
  <View style={styles.mastercardLogo}>
    <View style={[styles.mcCircle, { backgroundColor: '#EB001B', marginRight: -8 }]} />
    <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', opacity: 0.9 }]} />
  </View>
);

const PaymentCard = ({ item }: { item: any }) => (
  <TouchableOpacity style={styles.paymentRow} activeOpacity={0.7}>
    <View style={styles.cardLogoBox}>
      {item.logo === 'visa' ? <VisaLogo /> : <MastercardLogo />}
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardName}>
        {item.type} •••• {item.last4}
      </Text>
      <Text style={styles.cardExpiry}>Expires {item.expiry}</Text>
    </View>
    <View style={styles.cardRight}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      <AppIcon name="›" size={20} color="#C0C0C0" />
    </View>
  </TouchableOpacity>
);

const TransactionRow = ({ item }: { item: any }) => (
  <View style={styles.txRow}>
    <View style={[styles.txIconBox, { backgroundColor: item.iconBg }]}>
      <AppIcon name={item.icon} size={16} color={item.iconColor} />
    </View>
    <View style={styles.txInfo}>
      <Text style={styles.txTitle}>{item.title}</Text>
      <Text style={styles.txDate}>{item.date}</Text>
    </View>
    <Text style={[styles.txAmount, { color: item.positive ? '#2E7D32' : '#1A1A1A' }]}>
      {item.amount}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PaymentsWalletScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0EB" />

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
          <Text style={styles.headerTitle}>Payments & Wallet</Text>
          <Text style={styles.headerSub}>Manage your money and payments</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Wallet Card ── */}
        <View style={styles.walletCard}>
          {/* Decorative wave lines */}
          <View style={styles.waveOverlay} />

          <View style={styles.walletLeft}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletAmount}>₹101</Text>
            <View style={styles.pointsBadge}>
              <AppIcon name="points" size={12} color={GOLD} fill={GOLD} />
              <Text style={styles.pointsText}>186 Points available</Text>
            </View>
            <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.85}>
              <Text style={styles.addMoneyText}>+ Add Money</Text>
            </TouchableOpacity>
          </View>

          {/* Wallet illustration placeholder */}
          <View style={styles.walletIllustration}>
            <AppIcon name="wallet" size={46} color="#fff" />
            <AppIcon name="points" size={16} color="#fff" fill="#fff" style={styles.sparkleIcon} />
          </View>
        </View>

        {/* ── Payment Methods ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity style={styles.manageBtn} activeOpacity={0.7}>
              <View style={styles.manageRow}><Text style={styles.manageText}>Manage</Text><AppIcon name="›" size={16} color={ACCENT} /></View>
            </TouchableOpacity>
          </View>

          {PAYMENT_METHODS.map((item, index) => (
            <View key={item.id}>
              <PaymentCard item={item} />
              {index < PAYMENT_METHODS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <TouchableOpacity style={styles.addCardBtn} activeOpacity={0.75}>
            <Text style={styles.addCardText}>+ Add New Card</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.manageRow}><Text style={styles.manageText}>View All</Text><AppIcon name="›" size={16} color={ACCENT} /></View>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.map((item) => (
            <TransactionRow key={item.id} item={item} />
          ))}
        </View>

        {/* ── Secure Payments Banner ── */}
        <TouchableOpacity style={styles.secureBanner} activeOpacity={0.8}>
          <View style={styles.shieldBox}>
            <AppIcon name="privacy" size={22} color="#fff" />
          </View>
          <View style={styles.secureInfo}>
            <Text style={styles.secureTitle}>100% Secure Payments</Text>
            <Text style={styles.secureSub}>Your payment details are safe with us.</Text>
          </View>
          <AppIcon name="›" size={20} color="#C0C0C0" />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BROWN = '#2C1A0E';
const ACCENT = '#8B5E3C';
const GOLD = '#C9A84C';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F0EB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Wallet Card
  walletCard: {
    backgroundColor: BROWN,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
    minHeight: 200,
    position: 'relative',
  },
  waveOverlay: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 40,
    borderColor: 'rgba(255,255,255,0.04)',
    right: -80,
    bottom: -80,
  },
  walletLeft: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  walletAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 20,
    gap: 6,
  },
  pointsStar: { fontSize: 13 },
  pointsText: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '600',
  },
  addMoneyBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  addMoneyText: {
    fontSize: 15,
    fontWeight: '700',
    color: BROWN,
  },
  walletIllustration: {
    position: 'absolute',
    right: 20,
    top: 20,
    alignItems: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
  },

  // Section card
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  manageBtn: {},
  manageText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '600',
  },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Payment method row
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardLogoBox: {
    width: 56,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#FAFAFA',
  },
  visaLogo: {
    paddingHorizontal: 6,
  },
  visaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1F71',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mcCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#888',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  defaultText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    color: '#CCCCCC',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 2,
  },

  // Add card
  addCardBtn: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: ACCENT,
  },

  // Transaction row
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  txIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  txInfo: { flex: 1 },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 12,
    color: '#999',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Secure banner
  secureBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shieldBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BROWN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  shieldIcon: { fontSize: 20 },
  secureInfo: { flex: 1 },
  secureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  secureSub: {
    fontSize: 12,
    color: '#999',
  },
});
