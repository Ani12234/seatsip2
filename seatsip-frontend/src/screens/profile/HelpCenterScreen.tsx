import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/ui/AppIcon';

// ── Tiny helpers ──────────────────────────────────────────────────────────────

const IconBox = ({ emoji, bg }: { emoji: string; bg: string }) => (
  <View style={[styles.iconBox, { backgroundColor: bg }]}>
    <AppIcon name={emoji} size={22} color="#4A3728" />
  </View>
);

const ChevronCircle = ({ color = '#F0EDE8', iconColor = '#555' }) => (
  <View style={[styles.chevronCircle, { backgroundColor: color }]}>
    <AppIcon name="›" size={18} color={iconColor} />
  </View>
);

// ── Topic Card ────────────────────────────────────────────────────────────────

const TopicCard = ({ emoji, bg, title, subtitle, chevronBg, chevronColor, onPress }: {
  emoji: string; bg: string; title: string; subtitle: string; chevronBg: string; chevronColor: string; onPress: () => void;
}) => (
  <TouchableOpacity style={styles.topicCard} onPress={onPress} activeOpacity={0.8}>
    <IconBox emoji={emoji} bg={bg} />
    <Text style={styles.topicTitle}>{title}</Text>
    <Text style={styles.topicSubtitle}>{subtitle}</Text>
    <View style={styles.topicChevronRow}>
      <ChevronCircle color={chevronBg} iconColor={chevronColor} />
    </View>
  </TouchableOpacity>
);

// ── FAQ Row ───────────────────────────────────────────────────────────────────

const FaqRow = ({ emoji, question, onPress }: { emoji: string; question: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.faqRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.faqIcon}>
      <AppIcon name={emoji} size={18} color="#4A3728" />
    </View>
    <Text style={styles.faqText}>{question}</Text>
    <AppIcon name="›" size={18} color="#C2B6A8" />
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F4EF" />
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
            <AppIcon name="back" size={18} color="#4A3728" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>How can we help you today?</Text>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchWrapper}>
          <AppIcon name="search" size={18} color="#BBAA99" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help articles..."
            placeholderTextColor="#BBAA99"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Popular Topics ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.viewAllRow}><Text style={styles.viewAll}>View all</Text><AppIcon name="›" size={16} color="#8B6F47" /></View>
          </TouchableOpacity>
        </View>

        <View style={styles.topicsGrid}>
          <TopicCard
            emoji="📦"
            bg="#F5EDE4"
            title="Orders"
            subtitle={"Track, cancel or\nmanage your orders"}
            chevronBg="#F0EDE8"
            chevronColor="#555"
            onPress={() => {}}
          />
          <TopicCard
            emoji="💳"
            bg="#EAF0EA"
            title="Payments"
            subtitle={"Payment methods,\nrefunds & wallets"}
            chevronBg="#F0EDE8"
            chevronColor="#555"
            onPress={() => {}}
          />
          <TopicCard
            emoji="📅"
            bg="#FDEAEA"
            title="Reservations"
            subtitle={"Table bookings,\nchanges & cancellations"}
            chevronBg="#FCDCDC"
            chevronColor="#E05050"
            onPress={() => {}}
          />
          <TopicCard
            emoji="👤"
            bg="#EAF0F8"
            title="Account"
            subtitle={"Profile settings,\nprivacy & security"}
            chevronBg="#DDE8F4"
            chevronColor="#4A7CC7"
            onPress={() => {}}
          />
        </View>

        {/* ── FAQs ── */}
        <View style={[styles.sectionRow, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.viewAllRow}><Text style={styles.viewAll}>View all</Text><AppIcon name="›" size={16} color="#8B6F47" /></View>
          </TouchableOpacity>
        </View>

        <View style={styles.faqCard}>
          <FaqRow emoji="🧾" question="How do I track my order?" onPress={() => {}} />
          <View style={styles.faqDivider} />
          <FaqRow emoji="📆" question="How do I cancel a reservation?" onPress={() => {}} />
          <View style={styles.faqDivider} />
          <FaqRow emoji="⭐" question="How do I redeem points?" onPress={() => {}} />
          <View style={styles.faqDivider} />
          <FaqRow emoji="💰" question="What payment methods are accepted?" onPress={() => {}} />
        </View>

        {/* ── Still need help? ── */}
        <View style={styles.supportCard}>
          {/* Decorative headset illustration area */}
          <View style={styles.supportIllustration}>
            <AppIcon name="support" size={44} color="#4A3728" />
            <View style={styles.chatBubble}>
              <AppIcon name="support" size={14} color="#4A3728" />
            </View>
          </View>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Still need help?</Text>
            <Text style={styles.supportSubtitle}>
              Our support team is available 24/7{'\n'}to assist you.
            </Text>
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85} onPress={() => {}}>
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
    backgroundColor: '#F8F4EF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F4EF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDE8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#4A3728',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1208',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#A89880',
    marginTop: 2,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#C8B8A0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3A2A1A',
    padding: 0,
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1208',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B8732A',
  },
  viewAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Topics grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 24,
  },
  topicCard: {
    width: '46.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#C8B8A0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 26,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1208',
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 12,
    color: '#A89880',
    lineHeight: 17,
    marginBottom: 14,
  },
  topicChevronRow: {
    alignItems: 'flex-start',
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 22,
  },

  // FAQ
  faqCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#C8B8A0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  faqText: {
    flex: 1,
    fontSize: 14,
    color: '#2A1A0A',
    fontWeight: '500',
  },
  faqChevron: {
    fontSize: 22,
    color: '#CCBBAA',
    fontWeight: '300',
  },
  faqDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0EAE2',
    marginLeft: 68,
  },

  // Support card
  supportCard: {
    backgroundColor: '#F0E8DF',
    marginHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    overflow: 'hidden',
  },
  supportIllustration: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headsetEmoji: {
    fontSize: 52,
  },
  chatBubble: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E07840',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1208',
    marginBottom: 6,
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#8A7060',
    lineHeight: 19,
    marginBottom: 14,
  },
  contactBtn: {
    backgroundColor: '#2A1A0A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contactBtnChevron: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
  },
});
