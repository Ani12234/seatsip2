import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../../components/ui/AppIcon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const POLICY_SECTIONS = [
  {
    id: 's1',
    title: 'Information We Collect',
    emoji: '📝',
    intro: 'We collect information to provide better services to all our users.',
    tag: 'REQUIRED DATA',
    rules: [
      'Personal identifiers (Name, email address, phone number)',
      'Location data (to help you find nearby cafes)',
      'Payment information (processed securely via Razorpay)',
      'Device information and app usage statistics',
    ],
    highlight: 'We never sell your personal data to third parties.',
  },
  {
    id: 's2',
    title: 'How We Use Information',
    emoji: '⚙️',
    intro: 'The information we collect is used to manage your account and process orders.',
    rules: [
      'To facilitate cafe reservations and food orders',
      'To manage your SeatSip Wallet and loyalty points',
      'To send notifications about your order status',
      'To improve our app features and user experience',
    ],
  },
  {
    id: 's3',
    title: 'Location Services',
    emoji: '📍',
    intro: 'SeatSip uses location data to suggest the best cafe spots near you.',
    tag: 'USER CONTROL',
    rules: [
      'Precise location is only used while the app is in use',
      'You can disable location permissions in your device settings',
      'Background location is used only for specific "Arrived" features',
    ],
    warning: 'Disabling location will limit your ability to find nearby cafes easily.',
  },
  {
    id: 's4',
    title: 'Data Sharing',
    emoji: '🤝',
    intro: 'We share your information only with necessary partners.',
    rules: [
      'With Cafes: To fulfill your orders and reservations',
      'With Payment Processors: To handle secure transactions',
      'Legal Requirements: When required by law or to protect rights',
    ],
  },
  {
    id: 's5',
    title: 'Data Security',
    emoji: '🛡️',
    intro: 'We work hard to protect SeatSip and our users from unauthorized access.',
    tag: 'ENCRYPTED',
    rules: [
      'All data transmissions use secure SSL/TLS encryption',
      'Regular security audits and updates',
      'Restricted access to personal data for employees',
    ],
  },
  {
    id: 's6',
    title: 'Your Rights',
    emoji: '👤',
    intro: 'You have full control over your personal information.',
    rules: [
      'Access and export your personal data',
      'Request correction of inaccurate information',
      'Delete your account and associated data (30-day grace period)',
      'Opt-out of marketing communications',
    ],
  },
  {
    id: 's7',
    title: 'Cookies & Tracking',
    emoji: '🍪',
    intro: 'We use cookies and similar technologies to remember your preferences.',
    rules: [
      'Persistent login sessions',
      'Theme preferences (Dark/Light mode)',
      'Language selections',
      'Anonymous analytics to find bugs',
    ],
  },
  {
    id: 's8',
    title: 'Contact Us',
    emoji: '📧',
    intro: 'If you have any questions about this Privacy Policy, please contact us.',
    rules: [
      'Email: privacy@seatsip.in',
      'Support: Visit the Help Center in the app',
      'Address: SeatSip Technologies, Bangalore, India',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [expandedId, setExpandedId] = useState<string | null>('s1');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleSection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/app_bg.png')}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={18} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Privacy Policy</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y > 300 && !showScrollTop) setShowScrollTop(true);
            else if (y <= 300 && showScrollTop) setShowScrollTop(false);
          }}
          scrollEventThrottle={16}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.iconCircle}>
                <AppIcon name="receipt" size={24} color="#C17D2E" />
              </View>
              <View>
                <Text style={styles.brandName}>SeatSip Privacy</Text>
                <Text style={styles.brandSub}>Your privacy, our priority</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Data Practices</Text>
            <Text style={styles.headerSubtitle}>
              Last updated: May 16, 2026. Please review how we protect your data.
            </Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>v2.4 Stable</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>GDPR Compliant</Text>
              </View>
            </View>
          </View>

          {/* Sections */}
          {POLICY_SECTIONS.map((section, index) => {
            const isExpanded = expandedId === section.id;
            return (
              <View key={section.id} style={styles.sectionCard}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sectionNum}>
                    <Text style={styles.sectionNumText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <AppIcon
                    name={isExpanded ? 'up' : 'down'}
                    size={14}
                    color="#AAA"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.sectionContent}>
                    {section.intro ? (
                      <Text style={styles.sectionIntro}>{section.intro}</Text>
                    ) : null}

                    {section.tag ? (
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{section.tag}</Text>
                      </View>
                    ) : null}

                    {section.rules.map((rule, i) => (
                      <View key={i} style={styles.ruleRow}>
                        <View style={styles.ruleDot} />
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                    ))}

                    {section.highlight ? (
                      <View style={styles.highlightBox}>
                        <AppIcon name="check" size={14} color="#4CAF50" />
                        <Text style={styles.highlightText}>{section.highlight}</Text>
                      </View>
                    ) : null}

                    {section.warning ? (
                      <View style={styles.warningBox}>
                        <AppIcon name="info" size={14} color="#E65100" />
                        <Text style={styles.warningText}>{section.warning}</Text>
                      </View>
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

  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0E8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 3,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#FFF8F0',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  brandName: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  brandSub: { fontSize: 12, color: '#999', marginTop: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#2C1A0E', letterSpacing: -0.5, marginBottom: 6 },
  headerSubtitle: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
  },
  metaText: { fontSize: 11, color: '#888', fontWeight: '700' },

  sectionCard: {
    backgroundColor: '#fff', borderRadius: 18, marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  sectionNum: {
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: '#FAF5EE',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#EDD9B0',
  },
  sectionNumText: { color: '#C17D2E', fontSize: 11, fontWeight: '800' },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  sectionContent: {
    paddingHorizontal: 16, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  sectionIntro: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 14, marginBottom: 12 },

  tagPill: {
    alignSelf: 'flex-start', backgroundColor: '#F0F7FF',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 10, borderWidth: 1, borderColor: '#D0E3FF',
  },
  tagPillText: { fontSize: 10, fontWeight: '800', color: '#0052CC' },

  ruleRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  ruleDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#C17D2E', marginTop: 7, flexShrink: 0,
  },
  ruleText: { flex: 1, fontSize: 13, color: '#4A3520', lineHeight: 20 },

  highlightBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#F0F9F0', borderRadius: 12,
    padding: 12, marginTop: 12,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  highlightText: { flex: 1, fontSize: 12, color: '#2E7D32', lineHeight: 18, fontWeight: '500' },

  warningBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FFF3E0', borderRadius: 12,
    padding: 12, marginTop: 12,
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  warningText: { flex: 1, fontSize: 12, color: '#BF360C', lineHeight: 18, fontWeight: '500' },

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
