import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TERMS = [
  {
    id: 1,
    title: 'Acceptance of Terms',
    preview: 'By accessing and using this application, you accept and agree to be bound by the terms and provision...',
    full: 'By accessing and using this application, you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.',
  },
  {
    id: 2,
    title: 'Use License',
    preview: 'Permission is granted to temporarily download one copy of the application for personal, non-commercial...',
    full: 'Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained in the application.',
  },
  {
    id: 3,
    title: 'Account Responsibilities',
    preview: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept...',
    full: 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.',
  },
  {
    id: 4,
    title: 'Orders & Payments',
    preview: 'All orders placed through the app are subject to availability and confirmation of the order price. We...',
    full: 'All orders placed through the app are subject to availability and confirmation of the order price. We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. Payment must be completed at the time of ordering.',
  },
  {
    id: 5,
    title: 'Cancellation Policy',
    preview: 'Orders can be cancelled within 5 minutes of placement. Reservations must be cancelled at least 2 hours prior...',
    full: 'Orders can be cancelled within 5 minutes of placement for a full refund. Reservations must be cancelled at least 2 hours prior to the booking time to avoid a cancellation fee. Late cancellations or no-shows may be charged a fee equivalent to 50% of the reservation value. We reserve the right to apply these fees at our discretion.',
  },
  {
    id: 6,
    title: 'Limitation of Liability',
    preview: 'In no event shall the app or its suppliers be liable for any damages arising out of the use or inability...',
    full: 'In no event shall the app or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our application, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.',
  },
];

// ── Accordion Item ─────────────────────────────────────────────────────────────

const AccordionItem = ({ item, isLast }: { item: any; isLast: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  return (
    <View style={[styles.accordionItem, isLast && styles.accordionItemLast]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.75}
      >
        {/* Number badge */}
        <View style={styles.numBadge}>
          <Text style={styles.numText}>{item.id}</Text>
        </View>

        {/* Text block */}
        <View style={styles.accordionTextBlock}>
          <Text style={styles.accordionTitle}>{item.title}</Text>
          <Text style={styles.accordionPreview} numberOfLines={expanded ? undefined : 2}>
            {expanded ? item.full : item.preview}
          </Text>
        </View>

        {/* Chevron */}
        <AppIcon name="›" size={22} color="#B8AA9A" style={expanded && styles.chevronUp} />
      </TouchableOpacity>

      {!isLast && <View style={styles.divider} />}
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TermsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F3EE" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AppIcon name="back" size={18} color="#3A2A18" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>
              Last updated:{' '}
              <Text style={styles.headerDate}>April 2026</Text>
            </Text>
          </View>
        </View>

        {/* ── Important Information Banner ── */}
        <View style={styles.infoBanner}>
          <View style={styles.shieldCircle}>
            <AppIcon name="privacy" size={28} color="#B8732A" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoBody}>
              Please read these terms and conditions carefully before using our app and services.
            </Text>
          </View>
        </View>

        {/* ── Accordion Sections ── */}
        <View style={styles.accordionCard}>
          {TERMS.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              isLast={index === TERMS.length - 1}
            />
          ))}
        </View>

        {/* ── Have Questions? ── */}
        <View style={styles.supportCard}>
          <View style={styles.supportLeft}>
            <AppIcon name="support" size={42} color="#B8732A" />
          </View>
          <View style={styles.supportRight}>
            <Text style={styles.supportTitle}>Have questions?</Text>
            <Text style={styles.supportSubtitle}>
              We're here to help you with anything.
            </Text>
            <TouchableOpacity
              style={styles.contactBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HelpCenter' as any)}
            >
              <AppIcon name="support" size={14} color="#fff" />
              <Text style={styles.contactBtnText}>Contact Support</Text>
              <AppIcon name="›" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F3EE',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F3EE',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDE8E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  backArrow: {
    fontSize: 18,
    color: '#3A2A18',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1008',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9A8878',
    marginTop: 4,
  },
  headerDate: {
    color: '#B8732A',
    fontWeight: '600',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#C8B090',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: {
    fontSize: 26,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B8732A',
    marginBottom: 5,
  },
  infoBody: {
    fontSize: 13,
    color: '#7A6858',
    lineHeight: 19,
  },

  // Accordion Card
  accordionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#C8B090',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  accordionItem: {},
  accordionItemLast: {},

  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },

  numBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  numText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A6040',
  },

  accordionTextBlock: {
    flex: 1,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1008',
    marginBottom: 5,
  },
  accordionPreview: {
    fontSize: 13,
    color: '#8A7868',
    lineHeight: 19,
  },

  chevron: {
    fontSize: 22,
    color: '#BBAA98',
    fontWeight: '300',
    transform: [{ rotate: '90deg' }],
    marginTop: 4,
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
    color: '#B8732A',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EDE8E0',
    marginLeft: 66,
  },

  // Support Card
  supportCard: {
    backgroundColor: '#EDE8E0',
    marginHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  supportLeft: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DDD5C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headsetEmoji: {
    fontSize: 36,
  },
  supportRight: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1008',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#7A6858',
    marginBottom: 14,
    lineHeight: 18,
  },
  contactBtn: {
    backgroundColor: '#2A1A0A',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  contactIcon: {
    fontSize: 14,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contactBtnChevron: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
