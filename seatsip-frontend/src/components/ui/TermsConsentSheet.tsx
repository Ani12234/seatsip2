import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AppIcon from './AppIcon';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TERMS_ACCEPTED_KEY = 'seatsip.terms.accepted';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  /** Called after user taps "I agree" - use this to trigger any post-acceptance logic */
  onAccepted?: () => void;
}

export default function TermsConsentSheet({ onAccepted }: Props) {
  const navigation = useNavigation<any>();
  const { user, refreshUser } = useAuth();
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Check on mount whether the user has already accepted
  useEffect(() => {
    // 1. If backend already has acceptance, don't show
    if (user?.terms_accepted_at) {
      return;
    }

    // 2. Check local storage
    AsyncStorage.getItem(TERMS_ACCEPTED_KEY)
      .then(val => {
        if (val !== 'true') {
          setVisible(true);
          // Slide the sheet up
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 8,
              tension: 60,
              useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = (slideAnim: Animated.Value, backdropAnim: Animated.Value, cb?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      cb?.();
    });
  };

  const handleAccept = async () => {
    try {
      // 1. Save to DB
      await authApi.acceptTerms();
      
      // 2. Save locally so we don't ask again on this device
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      
      // 3. Refresh user state in AuthContext so terms_accepted_at is updated
      await refreshUser();
      
      // 4. Dismiss UI
      dismiss(slideAnim, backdropAnim, onAccepted);
    } catch (err) {
      console.error('Failed to save terms acceptance', err);
      // Even if DB fails, we might want to let them proceed, 
      // but ideally we should retry or inform them.
      // For now, we'll proceed locally to not block the user.
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      dismiss(slideAnim, backdropAnim, onAccepted);
    }
  };

  const handleDecline = () => {
    dismiss(slideAnim, backdropAnim);
  };

  const handleReadTerms = () => {
    navigation.navigate('Terms');
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible && isFocused} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Icon */}
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>☕</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.title}>Before you continue</Text>
        <Text style={styles.subtitle}>
          We've updated our Terms of Service and Privacy Policy. Please review and accept them to continue using SeatSip.
        </Text>

        {/* Read terms link */}
        <TouchableOpacity style={styles.readLink} onPress={handleReadTerms} activeOpacity={0.7}>
          <AppIcon name="receipt" size={15} color="#C17D2E" />
          <Text style={styles.readLinkText}>Read Terms & Conditions</Text>
          <AppIcon name="›" size={16} color="#C17D2E" />
        </TouchableOpacity>

        {/* Consent caption */}
        <Text style={styles.caption}>
          By tapping <Text style={styles.captionBold}>"I agree"</Text>, you confirm you have read and accept our{' '}
          <Text style={styles.captionBold}>Terms of Service</Text> and{' '}
          <Text style={styles.captionBold}>Privacy Policy</Text>.
        </Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
            <AppIcon name="check" size={15} color="#fff" />
            <Text style={styles.acceptBtnText}>I agree</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0D8D0',
    marginBottom: 20,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  iconEmoji: { fontSize: 28 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A6A5A',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  readLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0D9B0',
  },
  readLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#C17D2E',
  },
  caption: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  captionBold: {
    color: '#7A6A5A',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDD5C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  acceptBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#2C1A0E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
});
