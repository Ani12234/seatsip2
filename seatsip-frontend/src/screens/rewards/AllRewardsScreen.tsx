import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wifi, Battery, Search, Home, QrCode, Gift, User, Lock, Bolt, ArrowRight, Coffee, Info, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../../components/ui/AppIcon';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REWARDS = [
  {
    id: '1',
    name: 'Free artisan coffee',
    points: 150,
    tier: 'Coffee',
    icon: '',
    category: 'Food & Drink',
    unlocked: true,
  },
  {
    id: '2',
    name: 'Phone-free booth (1 hr)',
    points: 300,
    tier: 'Coffee',
    icon: '',
    category: 'Experience',
    unlocked: true,
  },
  {
    id: '3',
    name: 'Pastry + coffee combo',
    points: 400,
    tier: 'Caramel',
    icon: '',
    category: 'Food & Drink',
    unlocked: false,
  },
  {
    id: '4',
    name: 'Priority window seat',
    points: 500,
    tier: 'Caramel',
    icon: '',
    category: 'Experience',
    unlocked: false,
  },
  {
    id: '5',
    name: 'Detox Day Pass',
    points: 1000,
    tier: 'Cream',
    icon: '',
    category: 'Experience',
    unlocked: false,
  },
  {
    id: '6',
    name: 'Branded journal',
    points: 800,
    tier: 'Cream',
    icon: '',
    category: 'Merch',
    unlocked: false,
  },
  {
    id: '7',
    name: 'Bring a friend free',
    points: 1200,
    tier: 'Cream',
    icon: '',
    category: 'Experience',
    unlocked: false,
  },
  {
    id: '8',
    name: 'Custom drink named after you',
    points: 2000,
    tier: 'Cream',
    icon: '',
    category: 'Food & Drink',
    unlocked: false,
  },
];

const TABS = ['All', 'Food & Drink', 'Experience', 'Merch'];

export default function AllRewardsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const points = user?.loyalty_points ?? 340;

  const nextTierPoints = 1000;
  const ptsToNext = nextTierPoints - points;
  const progress = (points / nextTierPoints) * 100;

  const filteredRewards = REWARDS.filter(r => activeTab === 'All' || r.category === activeTab);

  const silverRewards = filteredRewards.filter(r => r.tier === 'Coffee');
  const goldRewards = filteredRewards.filter(r => r.tier === 'Caramel');
  const platinumRewards = filteredRewards.filter(r => r.tier === 'Cream');

  const renderRewardCard = (reward: any) => (
    <TouchableOpacity 
      key={reward.id} 
      style={[styles.rewardCard, !reward.unlocked && styles.rewardCardLocked]}
      activeOpacity={reward.unlocked ? 0.8 : 1}
    >
      {!reward.unlocked && (
        <View style={styles.lockOverlay}>
          <Lock size={14} color="#999" />
        </View>
      )}
      <Text style={styles.rewardIcon}>{reward.icon}</Text>
      <Text style={styles.rewardName} numberOfLines={2}>{reward.name}</Text>
      <View style={styles.rewardMeta}>
        <Text style={styles.pointsCost}>{reward.points} pts</Text>
        <View style={[styles.tierTag, reward.tier === 'Coffee' ? styles.tagCoffee : reward.tier === 'Caramel' ? styles.tagCaramel : styles.tagCream]}>
          <Text style={styles.tierTagText}>{reward.tier}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Rewards</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Points Banner */}
          <View style={styles.pointsBanner}>
            <View style={styles.pointsLeft}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <View style={styles.pointsValueRow}>
                <Text style={styles.pointsValue}>{points}</Text>
                <Text style={styles.pointsUnit}> pts</Text>
              </View>

            </View>
            <View style={styles.tierBadge}>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>Coffee</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressEndLabels}>
                <Text style={styles.progressEndLabel}>0</Text>
                <Text style={styles.progressEndLabel}>1000</Text>
              </View>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {TABS.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab ? styles.tabActive : styles.tabInactive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Silver Section */}
          {silverRewards.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Unlocked · Coffee</Text>
              <View style={styles.rewardGrid}>
                {silverRewards.map(renderRewardCard)}
              </View>
            </>
          )}

          {/* Gold Section */}
          {goldRewards.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Caramel Tier Required</Text>
              <View style={styles.rewardGrid}>
                {goldRewards.map(renderRewardCard)}
              </View>
            </>
          )}

          {/* Platinum Section */}
          {platinumRewards.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Cream Tier Required</Text>
              <View style={styles.rewardGrid}>
                {platinumRewards.map(renderRewardCard)}
              </View>
            </>
          )}

          {/* Bottom CTA */}
          <TouchableOpacity style={styles.bottomCta} activeOpacity={0.9}>
            <View style={styles.ctaIconBox}>
              <Zap size={18} color="#B8860B" fill="#B8860B" />
            </View>
            <View style={styles.ctaTextBox}>
              <Text style={styles.ctaTitle}>Need 50 more points?</Text>
              <Text style={styles.ctaSub}>Write a review to unlock your first reward</Text>
            </View>
            <ArrowRight size={20} color="#999" />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  safeArea: { flex: 1, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
  pointsBanner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pointsLeft: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  pointsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  pointsUnit: {
    fontSize: 18,
    color: '#B8934A',
    fontWeight: '700',
  },
  _rupeeValue_removed: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  tierBadge: {
    alignItems: 'flex-end',
    width: 130,
  },
  tierPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  tierPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressEndLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  progressEndLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B8934A',
    borderRadius: 2,
  },
  tabsContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  tabInactive: {
    backgroundColor: '#FFF',
    borderColor: '#EEE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  tabTextInactive: {
    color: '#666',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rewardCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  rewardCardLocked: {
    backgroundColor: '#F9F9F9',
    opacity: 0.8,
  },
  lockOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 12,
    height: 36,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsCost: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B8860B',
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagCoffee: {
    backgroundColor: '#3F1D0E',
  },
  tagCaramel: {
    backgroundColor: '#A2663C',
  },
  tagCream: {
    backgroundColor: '#E4CDB0',
  },
  tierTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3E8',
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0EBE3',
  },
  ctaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ctaTextBox: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  ctaSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
