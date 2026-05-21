import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../../components/ui/AppIcon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Data ────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 's1', num: 1, icon: 'user', tocIcon: '👤', tocLabel: 'Eligibility',
    title: 'Acceptance & Eligibility',
    intro: 'By downloading, installing, or using the SeatSip App ("the App"), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.',
    tag: 'Who can use the app',
    rules: [
      'You must be at least 18 years of age to create an account and place orders independently.',
      'Users aged 13–17 may use the app only with verified parental or guardian consent.',
      'By using the app you represent that all information provided is accurate and up to date.',
      'SeatSip reserves the right to suspend or terminate accounts found to be in violation of eligibility requirements.',
    ],
    highlight: 'These Terms constitute a legally binding agreement between you and SeatSip Technologies Pvt. Ltd., registered in Bengaluru, Karnataka, India.',
    defaultOpen: true,
  },
  {
    id: 's2', num: 2, icon: 'cart', tocIcon: '🛒', tocLabel: 'Ordering',
    title: 'Ordering Food & Beverages',
    intro: 'All orders placed through the App are subject to availability and confirmation by our kitchen staff. Placing an order does not guarantee fulfillment if items become unavailable after submission.',
    tag: 'Order rules',
    rules: [
      'Menu items, prices, and availability may change without prior notice. Prices displayed are inclusive of applicable GST unless stated otherwise.',
      'Customisation requests are accommodated where possible but cannot be guaranteed.',
      'We are not liable for allergen-related issues arising from customisations. Please inform staff of severe allergies before ordering.',
      'Orders for dine-in are valid for 30 minutes from placement. Expired orders will be cancelled automatically.',
      'Takeaway orders must be collected within 15 minutes of the "Ready" notification. Uncollected orders are non-refundable.',
      'SeatSip reserves the right to refuse service to anyone violating these Terms or behaving in a disruptive manner.',
    ],
    warning: 'Allergen information is provided in good faith. SeatSip cannot guarantee a completely allergen-free environment due to shared kitchen facilities.',
    defaultOpen: false,
  },
  {
    id: 's3', num: 3, icon: 'reservation', tocIcon: '🪑', tocLabel: 'Table booking',
    title: 'Table Booking & Reservations',
    intro: 'Table reservations can be made through the App up to 30 days in advance and are subject to availability at the time of booking.',
    tag: 'Booking terms',
    rules: [
      'A booking confirmation is sent via email and in-app notification. The booking is not confirmed until you receive this notification.',
      'Reservations are held for a maximum of 15 minutes past the booked time. After this grace period, the table may be released to walk-in guests.',
      'Group bookings of 8 or more require a prepaid deposit of ₹500 per head, refundable if cancelled 24 hours in advance.',
      'Special occasion setups must be requested at least 48 hours in advance and may incur an additional charge.',
      'SeatSip reserves the right to modify or cancel bookings due to force majeure events or operational requirements.',
      'Noise levels, music preferences, and seating arrangements are at the discretion of café management.',
    ],
    highlight: 'We allow a maximum of 2 active reservations per account at any given time. Duplicate or fraudulent bookings may result in account suspension.',
    defaultOpen: false,
  },
  {
    id: 's4', num: 4, icon: 'card', tocIcon: '💳', tocLabel: 'Payments',
    title: 'Payments & Pricing',
    intro: 'SeatSip accepts payments via UPI, credit/debit cards, net banking, and SeatSip wallet credits. All transactions are processed through PCI-DSS compliant payment gateways.',
    tag: 'Payment rules',
    rules: [
      'All prices are in Indian Rupees (₹). International cards are accepted but may incur foreign transaction fees from your bank.',
      'SeatSip Wallet credits are non-transferable, non-refundable for cash, and expire 12 months from the date of issue.',
      'Promotional discounts and coupon codes cannot be combined unless explicitly stated.',
      'In the event of a failed transaction, do not retry immediately. Check your bank statement before re-attempting to avoid duplicate charges.',
      'Surge pricing may apply during peak hours and will be clearly indicated before checkout.',
      'Receipts are issued digitally via email and are accessible under "Order History" in the App.',
    ],
    warning: 'SeatSip does not store full card details. We are not liable for unauthorised transactions originating from your device or account credentials.',
    defaultOpen: false,
  },
  {
    id: 's5', num: 5, icon: 'refresh', tocIcon: '🔄', tocLabel: 'Cancellations',
    title: 'Cancellations & Refunds',
    tag: 'Orders',
    rules: [
      'Food and beverage orders may be cancelled within 2 minutes of placement for a full refund, provided preparation has not commenced.',
      'Once an order enters preparation ("In Kitchen" status), cancellations are not accepted.',
      'Refunds for approved cancellations are processed within 5–7 business days to the original payment method.',
      'In case of quality issues or incorrect items, please raise a complaint within 30 minutes via the "Help" section in the App.',
    ],
    tag2: 'Table bookings',
    rules2: [
      'Free cancellation is available up to 4 hours before the booking time for standard reservations.',
      'Group deposits (8+ guests) are refundable if cancelled at least 24 hours before the reservation.',
      'No-shows without prior cancellation will result in a ₹200 no-show fee charged to the payment method on file.',
      'SeatSip reserves the right to waive cancellation fees at its discretion in exceptional circumstances.',
    ],
    highlight: 'Refund disputes must be raised within 7 days of the transaction. Contact us at support@seatsip.app or through the in-app chat.',
    defaultOpen: false,
  },
  {
    id: 's6', num: 6, icon: 'privacy', tocIcon: '🛡️', tocLabel: 'Privacy',
    title: 'Privacy & Data Usage',
    intro: 'Your use of the App is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the App, you consent to the collection and use of your data as described therein.',
    tag: 'What we collect',
    rules: [
      'Personal information: name, email, phone number, and delivery address for order fulfilment.',
      'Order history and preferences to personalise your experience and suggest relevant items.',
      'Device identifiers and app usage data for performance optimisation and security.',
      'Location data (with your permission) to show nearby SeatSip partner cafés and estimated delivery times.',
    ],
    tag2: 'Your rights',
    rules2: [
      'You may request access to, correction of, or deletion of your personal data at any time via account settings.',
      'Data deletion requests are processed within 30 days and may result in loss of order history and loyalty points.',
      'We do not sell your personal data to third parties. Aggregated, anonymised data may be used for analytics.',
    ],
    defaultOpen: false,
  },
  {
    id: 's7', num: 7, icon: 'secure', tocIcon: '⚠️', tocLabel: 'Liability',
    title: 'Liability & Disclaimers',
    intro: 'SeatSip strives to provide a seamless and enjoyable experience. However, we cannot guarantee uninterrupted availability of the App or services.',
    rules: [
      'SeatSip is not liable for indirect, incidental, or consequential damages arising from use or inability to use the App.',
      'Our maximum liability for any claim arising from a single order shall not exceed the value of that order.',
      'We are not responsible for delays or failures caused by third-party delivery partners, network outages, or circumstances beyond our reasonable control.',
      'User-generated content posted on the App must be original, honest, and non-defamatory. We reserve the right to remove content that violates these guidelines.',
      'Misuse of promotional offers will result in permanent account suspension and forfeiture of any associated rewards.',
    ],
    warning: 'The App is provided "as is" without warranty of any kind. SeatSip disclaims all implied warranties to the maximum extent permitted by law.',
    defaultOpen: false,
  },
  {
    id: 's8', num: 8, icon: 'receipt', tocIcon: '⚖️', tocLabel: 'Governing law',
    title: 'Governing Law & Changes',
    intro: 'These Terms are governed by and construed in accordance with the laws of India, specifically the jurisdiction of Bengaluru, Karnataka.',
    rules: [
      'Any disputes shall first be attempted to be resolved through amicable negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under the Indian Arbitration and Conciliation Act, 1996.',
      'SeatSip reserves the right to modify these Terms at any time. Material changes will be communicated via in-app notification and email at least 14 days before taking effect.',
      'Continued use of the App after the effective date of changes constitutes acceptance of the revised Terms.',
      'If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.',
    ],
    highlight: 'Questions about these Terms? Contact our legal team at legal@seatsip.app or write to: SeatSip Technologies Pvt. Ltd., Bengaluru, Karnataka 560025.',
    defaultOpen: false,
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────
const TagPill = ({ label }: { label: string }) => (
  <View style={styles.tagPill}>
    <Text style={styles.tagPillText}>{label}</Text>
  </View>
);

const RuleItem = ({ text }: { text: string }) => (
  <View style={styles.ruleRow}>
    <View style={styles.ruleDot} />
    <Text style={styles.ruleText}>{text}</Text>
  </View>
);

const HighlightBox = ({ text }: { text: string }) => (
  <View style={styles.highlightBox}>
    <AppIcon name="check" size={14} color="#2E7D32" />
    <Text style={styles.highlightText}>{text}</Text>
  </View>
);

const WarningBox = ({ text }: { text: string }) => (
  <View style={styles.warningBox}>
    <AppIcon name="bell" size={14} color="#E65100" />
    <Text style={styles.warningText}>{text}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TermsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map(s => [s.id, s.defaultOpen]))
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleSection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const y = sectionRefs.current[id];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 16, animated: true });
      if (!openSections[id]) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSections(prev => ({ ...prev, [id]: true }));
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/app_bg.png')}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* ── Top nav ── */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={18} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Terms of Service</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y > 300 && !showScrollTop) setShowScrollTop(true);
            else if (y <= 300 && showScrollTop) setShowScrollTop(false);
          }}
          scrollEventThrottle={16}
        >
          {/* ── Header card ── */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <Text style={styles.headerEmoji}>☕</Text>
              <View>
                <Text style={styles.brandName}>SeatSip</Text>
                <Text style={styles.brandSub}>Café App</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Terms of Service</Text>
            <Text style={styles.headerSubtitle}>Please read carefully before using our app</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <AppIcon name="date" size={12} color="#7A5C3A" />
                <Text style={styles.metaText}>Effective: 1 Jan 2025</Text>
              </View>
              <View style={styles.metaBadge}>
                <AppIcon name="refresh" size={12} color="#7A5C3A" />
                <Text style={styles.metaText}>Updated: 16 May 2026</Text>
              </View>
            </View>
          </View>

          {/* ── Table of Contents ── */}
          <View style={styles.tocCard}>
            <Text style={styles.tocLabel}>Table of contents</Text>
            <View style={styles.tocGrid}>
              {SECTIONS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.tocItem}
                  onPress={() => scrollToSection(s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tocEmoji}>{s.tocIcon}</Text>
                  <Text style={styles.tocItemText}>{s.tocLabel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Sections ── */}
          {SECTIONS.map(section => {
            const isOpen = openSections[section.id];
            return (
              <View
                key={section.id}
                style={styles.sectionCard}
                onLayout={e => { sectionRefs.current[section.id] = e.nativeEvent.layout.y; }}
              >
                {/* Header row */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.sectionNum}>
                    <Text style={styles.sectionNumText}>{section.num}</Text>
                  </View>
                  <Text style={styles.sectionTitle} numberOfLines={2}>{section.title}</Text>
                  <AppIcon
                    name={isOpen ? 'chevron_down' : '›'}
                    size={18}
                    color={isOpen ? '#C17D2E' : '#CCCCCC'}
                  />
                </TouchableOpacity>

                {/* Collapsible content */}
                {isOpen && (
                  <View style={styles.sectionContent}>
                    {'intro' in section && section.intro ? (
                      <Text style={styles.sectionIntro}>{section.intro}</Text>
                    ) : null}

                    {'tag' in section && section.tag ? <TagPill label={section.tag} /> : null}
                    {'rules' in section && section.rules ? section.rules.map((r, i) => <RuleItem key={i} text={r} />) : null}

                    {'tag2' in section && section.tag2 ? (
                      <>
                        <View style={{ height: 8 }} />
                        <TagPill label={section.tag2} />
                      </>
                    ) : null}
                    {'rules2' in section && (section as any).rules2 ? (section as any).rules2.map((r: string, i: number) => <RuleItem key={`r2-${i}`} text={r} />) : null}

                    {'highlight' in section && section.highlight ? (
                      <HighlightBox text={section.highlight} />
                    ) : null}
                    {'warning' in section && (section as any).warning ? (
                      <WarningBox text={(section as any).warning} />
                    ) : null}
                  </View>
                )}
              </View>
            );
          })}


        </ScrollView>

        {showScrollTop && (
          <TouchableOpacity
            style={[styles.scrollTopBtn, { bottom: insets.bottom + 20 }]}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            activeOpacity={0.9}
          >
            <AppIcon name="chevron_up" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Header card
  headerCard: {
    backgroundColor: '#2C1A0E',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerEmoji: { fontSize: 32 },
  brandName: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  brandSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 50,
  },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // TOC
  tocCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  tocLabel: { fontSize: 11, fontWeight: '700', color: '#AAAAAA', letterSpacing: 1.1, marginBottom: 12 },
  tocGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tocItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FAF5EE', borderRadius: 50,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#EDE0CF',
  },
  tocEmoji: { fontSize: 13 },
  tocItemText: { fontSize: 12, fontWeight: '600', color: '#4A3520' },

  // Sections
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#2C1A0E',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A1A' },

  sectionContent: {
    paddingHorizontal: 16, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#F5F0E8',
  },
  sectionIntro: { fontSize: 13, color: '#5A4A3A', lineHeight: 19, marginTop: 12, marginBottom: 10 },

  // Tag pill
  tagPill: {
    alignSelf: 'flex-start', backgroundColor: '#FAF0E0',
    borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 8, marginTop: 4,
    borderWidth: 1, borderColor: '#EDD9B0',
  },
  tagPillText: { fontSize: 11, fontWeight: '700', color: '#7A4A10' },

  // Rule items
  ruleRow: { flexDirection: 'row', gap: 10, marginBottom: 7, alignItems: 'flex-start' },
  ruleDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#C17D2E', marginTop: 6, flexShrink: 0,
  },
  ruleText: { flex: 1, fontSize: 13, color: '#4A3520', lineHeight: 19 },

  // Highlight box
  highlightBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#F0F9F0', borderRadius: 10,
    padding: 12, marginTop: 10,
    borderLeftWidth: 3, borderLeftColor: '#4CAF50',
  },
  highlightText: { flex: 1, fontSize: 12, color: '#2E7D32', lineHeight: 18 },

  // Warning box
  warningBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FFF3E0', borderRadius: 10,
    padding: 12, marginTop: 10,
    borderLeftWidth: 3, borderLeftColor: '#E65100',
  },
  warningText: { flex: 1, fontSize: 12, color: '#BF360C', lineHeight: 18 },

  scrollTopBtn: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C1A0E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});

