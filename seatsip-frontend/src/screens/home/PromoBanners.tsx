/**
 * PromoBanners.tsx
 *
 * Drop-in banner components for HomeScreen.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { AppIcon } from '../../components/ui';
import { BRAND } from '../../constants/brand';

// ─── Shared palette ────────────────────────────────────────────────────────────
const C = {
  black:  '#0d0d0d',
  dark:   '#111111',
  panel:  '#181008',
  gold:   '#C8A96E',
  goldDim:'#8a7040',
  white:  '#FFFFFF',
  muted:  '#555555',
  muted2: '#888888',
  slash:  '#C8A96E',
};

// ─── Tiny logo mark ─────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <View style={logo.wrap}>
      <View style={logo.cup}>
        <AppIcon name="coffee" size={12} color={C.gold} />
      </View>
      <View>
        <Text style={logo.name}>Manual</Text>
        <Text style={logo.name}>Brewing</Text>
      </View>
    </View>
  );
}
const logo = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cup:      { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  name:     { fontSize: 6, color: C.muted2, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 8 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// BANNER 1 — "Special Menu / 30% Off"   (place ABOVE "Cafes Near You")
// ═══════════════════════════════════════════════════════════════════════════════
export function SpecialMenuBanner({ onPress }: { onPress?: () => void }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const pctScale = shimmer.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={b1.root}>

      {/* LEFT PANEL */}
      <View style={b1.left}>
        <LogoMark />
        <View>
          <Text style={b1.specialTxt}>Special</Text>
          <Text style={b1.menuTxt}>Menu</Text>
        </View>
        <Text style={b1.url}>www.{BRAND.domain}</Text>
      </View>

      {/* CENTER — photo */}
      <View style={b1.center}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400' }} 
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
      </View>

      {/* RIGHT PANEL */}
      <View style={b1.right}>
        <Text style={b1.promoLabel}>Special Promo</Text>
        <Animated.Text style={[b1.pct, { transform: [{ scale: pctScale }] }]}>
          30%
        </Animated.Text>
        <Text style={b1.allItem}>All Item</Text>
      </View>

    </TouchableOpacity>
  );
}

const HEX_SIZE = 90;

const b1 = StyleSheet.create({
  root: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    height: 130,
    backgroundColor: C.dark,
    marginTop: 16,
  },

  // Left
  left: {
    width: '38%',
    backgroundColor: C.black,
    padding: 14,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#1e1e1e',
  },
  specialTxt: { fontSize: 10, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  menuTxt:    { fontSize: 22, color: C.white, fontWeight: '900', letterSpacing: 0.5, marginTop: 1 },
  url:        { fontSize: 7, color: C.muted, letterSpacing: 0.8 },

  // Center
  center: {
    flex: 1,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hexOuter: {
    position: 'absolute',
    width: HEX_SIZE,
    height: HEX_SIZE,
    borderRadius: HEX_SIZE * 0.13,
    backgroundColor: '#2a1c08',
    transform: [{ rotate: '30deg' }],
  },
  hexInner: {
    width: HEX_SIZE - 10,
    height: HEX_SIZE - 10,
    borderRadius: (HEX_SIZE - 10) * 0.13,
    backgroundColor: '#1e1208',
    transform: [{ rotate: '30deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupIcon: { transform: [{ rotate: '-30deg' }] },
  beans:    { position: 'absolute', fontSize: 9, color: '#3a2510', letterSpacing: 3 },

  // Right
  right: {
    width: '33%',
    backgroundColor: C.black,
    borderLeftWidth: 1,
    borderLeftColor: '#1e1e1e',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 14,
    gap: 2,
  },
  promoLabel: { fontSize: 7, color: C.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  pct:        { fontSize: 38, color: C.white, fontWeight: '900', lineHeight: 40 },
  allItem:    { fontSize: 8, color: C.muted2, letterSpacing: 2, textTransform: 'uppercase' },
});


// ═══════════════════════════════════════════════════════════════════════════════
// BANNER 2 — "Open Today"  (place ABOVE "Trending")
// ═══════════════════════════════════════════════════════════════════════════════
export function OpenTodayBanner({ onPress }: { onPress?: () => void }) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: 800, useNativeDriver: false }),
        Animated.timing(blink, { toValue: 1,   duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={b5.root}>

      {/* Photo area (right half) */}
      <View style={b5.photoArea}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' }} 
          style={StyleSheet.absoluteFillObject}
        />
        {/* Fade overlay from left */}
        <View style={b5.fade} />
      </View>

      {/* Content (overlays photo) */}
      <View style={b5.content}>
        <LogoMark />

        <View style={b5.openRow}>
          <Text style={b5.openWord}>Open</Text>
          <Animated.View style={[b5.dot, { opacity: blink }]} />
          <Text style={b5.openWord}>Today</Text>
        </View>

        <View style={b5.contactRow}>
          <View style={b5.contactItem}>
            <AppIcon name="phone" size={10} color={C.muted2} />
            <Text style={b5.contactTxt}>{BRAND.supportPhoneDisplay}</Text>
          </View>
          <View style={b5.contactItem}>
            <AppIcon name="email" size={10} color={C.muted2} />
            <Text style={b5.contactTxt}>{BRAND.supportEmail}</Text>
          </View>
        </View>
      </View>

    </TouchableOpacity>
  );
}

const b5 = StyleSheet.create({
  root: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    height: 110,
    backgroundColor: C.black,
    position: 'relative',
    marginTop: 16,
  },

  photoArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '55%',
    backgroundColor: '#0a0805',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { opacity: 0.7 },
  fade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    // Simulated left-to-right fade using a dark overlay
    backgroundColor: C.black,
    opacity: 0.85,
  },

  content: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    padding: 14,
    justifyContent: 'space-between',
  },

  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  openWord: {
    fontSize: 24,
    fontWeight: '900',
    color: C.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gold,
  },

  contactRow:  { flexDirection: 'row', gap: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactTxt:  { fontSize: 8, color: C.muted2, letterSpacing: 0.3 },
});


// ═══════════════════════════════════════════════════════════════════════════════
// BONUS: Buy 1 Get 1 Banner  (optional — use wherever needed)
// ═══════════════════════════════════════════════════════════════════════════════
export function BuyOneGetOneBanner({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={b2.root}>

      {/* Left dark panel */}
      <View style={b2.left}>
        <LogoMark />
        <View>
          <Text style={b2.special}>Special</Text>
          <Text style={b2.menu}>Menu</Text>
        </View>
        <Text style={b2.url}>www.{BRAND.domain}</Text>
      </View>

      {/* Center light panel — diagonal clip via skew */}
      <View style={b2.centerWrap}>
        <View style={b2.centerInner}>
          <Text style={b2.b1g1}>BUY 1{'\n'}GET 1</Text>
          <View style={b2.contactLine}>
            <AppIcon name="phone" size={8} color="#555" />
            <Text style={b2.contact}>{BRAND.supportPhoneDisplay}</Text>
          </View>
          <View style={b2.contactLine}>
            <AppIcon name="email" size={8} color="#555" />
            <Text style={b2.contact}>{BRAND.supportEmail}</Text>
          </View>
        </View>
      </View>

      {/* Right — two photo columns */}
      <View style={b2.photoWrap}>
        <View style={b2.photoCol}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300' }} style={StyleSheet.absoluteFillObject} />
        </View>
        <View style={b2.photoCol}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1544787210-2213d84ad962?w=300' }} style={StyleSheet.absoluteFillObject} />
        </View>
      </View>

    </TouchableOpacity>
  );
}

const b2 = StyleSheet.create({
  root: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    height: 130,
    backgroundColor: C.dark,
    marginTop: 16,
  },
  left: {
    width: '35%',
    backgroundColor: C.black,
    padding: 13,
    justifyContent: 'space-between',
  },
  special: { fontSize: 10, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  menu:    { fontSize: 22, color: C.white, fontWeight: '900', marginTop: 1 },
  url:     { fontSize: 7, color: C.muted, letterSpacing: 0.8 },

  centerWrap: { width: '28%', backgroundColor: '#f0ebe0', justifyContent: 'center', padding: 12 },
  centerInner: { gap: 6 },
  b1g1:    { fontSize: 16, fontWeight: '900', color: '#111', lineHeight: 18, letterSpacing: -0.5 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  contact: { fontSize: 7, color: '#555', lineHeight: 12 },

  photoWrap: { flex: 1, flexDirection: 'row' },
  photoCol:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
