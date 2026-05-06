import React from 'react';
import {
  TouchableOpacity, Text, View, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, Image,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import AppIcon from './AppIcon';

export { default as AppIcon } from './AppIcon';

// ===== BUTTON =====
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style, textStyle, fullWidth,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.btn,
    styles[`btn_${variant}` as keyof typeof styles] as ViewStyle,
    styles[`btn_size_${size}` as keyof typeof styles] as ViewStyle,
    fullWidth && { width: '100%' },
    isDisabled && styles.btn_disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const txtStyle: TextStyle[] = [
    styles.btn_text,
    styles[`btn_text_${variant}` as keyof typeof styles] as TextStyle,
    styles[`btn_text_size_${size}` as keyof typeof styles] as TextStyle,
    isDisabled && { opacity: 0.5 },
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <View style={styles.btn_inner}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={txtStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ===== BADGE =====
export const Badge: React.FC<{ label: string; color?: string; size?: 'sm' | 'md' }> = ({
  label, color = Colors.accent, size = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }, size === 'sm' && styles.badge_sm]}>
    <Text style={[styles.badge_text, { color }, size === 'sm' && { fontSize: 10 }]}>{label}</Text>
  </View>
);

// ===== STAR RATING =====
export const StarRating: React.FC<{ rating: number; count?: number; size?: number }> = ({
  rating, count, size = 14,
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {stars.map(s => (
        <AppIcon key={s} name="popular" size={size} color={s <= Math.round(rating) ? '#F59E0B' : Colors.border} fill={s <= Math.round(rating) ? '#F59E0B' : 'none'} />
      ))}
      <Text style={{ fontSize: size - 2, color: Colors.textSecondary, marginLeft: 4 }}>
        {rating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
      </Text>
    </View>
  );
};

// ===== SKELETON =====
export const Skeleton: React.FC<{ width?: number | string; height?: number; radius?: number; style?: ViewStyle }> = ({
  width = '100%', height = 16, radius = Radius.sm, style,
}) => (
  <View style={[{ width: width as any, height, borderRadius: radius, backgroundColor: Colors.creamDark }, style]} />
);

// ===== PRICE LEVEL =====
export const PriceLevel: React.FC<{ level: number }> = ({ level }) => (
  <Text style={{ color: Colors.textSecondary, fontSize: Typography.sm }}>
    {'₹'.repeat(level)}<Text style={{ opacity: 0.3 }}>{'₹'.repeat(4 - level)}</Text>
  </Text>
);

// ===== VEG INDICATOR =====
export const VegIndicator: React.FC<{ isVeg: boolean; size?: number }> = ({ isVeg, size = 16 }) => (
  <View style={{
    width: size, height: size,
    borderWidth: 1.5,
    borderColor: isVeg ? Colors.vegGreen : Colors.error,
    borderRadius: 2,
    alignItems: 'center', justifyContent: 'center',
  }}>
    <View style={{
      width: size * 0.45, height: size * 0.45,
      borderRadius: size,
      backgroundColor: isVeg ? Colors.vegGreen : Colors.error,
    }} />
  </View>
);

// ===== DIVIDER =====
export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: Colors.divider }, style]} />
);

// ===== EMPTY STATE =====
export const EmptyState: React.FC<{
  emoji: string; title: string; subtitle?: string;
  action?: { label: string; onPress: () => void };
}> = ({ emoji, title, subtitle, action }) => (
  <View style={styles.empty}>
    <AppIcon name={emoji} size={56} color={Colors.accent} style={styles.empty_icon} />
    <Text style={styles.empty_title}>{title}</Text>
    {subtitle && <Text style={styles.empty_sub}>{subtitle}</Text>}
    {action && (
      <Button title={action.label} onPress={action.onPress} size="sm" style={{ marginTop: 16 }} />
    )}
  </View>
);

// ===== SECTION HEADER =====
export const SectionHeader: React.FC<{
  title: string; action?: string; onAction?: () => void;
  style?: ViewStyle;
}> = ({ title, action, onAction, style }) => (
  <View style={[styles.section_header, style]}>
    <Text style={styles.section_title}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.section_action}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ===== TAG =====
export const Tag: React.FC<{ label: string; color?: string; onPress?: () => void }> = ({
  label, color = Colors.accent, onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
    style={[styles.tag, { borderColor: color }]}
  >
    <Text style={[styles.tag_text, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Button base
  btn: { borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  btn_inner: { flexDirection: 'row', alignItems: 'center' },
  btn_disabled: { opacity: 0.6 },

  // Button variants
  btn_primary: { backgroundColor: Colors.primary },
  btn_secondary: { backgroundColor: Colors.accent },
  btn_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary, ...Shadow.sm },
  btn_ghost: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  btn_danger: { backgroundColor: Colors.error },

  // Button sizes
  btn_size_sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm - 2, minHeight: 36 },
  btn_size_md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 48 },
  btn_size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, minHeight: 56 },

  // Button text
  btn_text: { fontWeight: Typography.semibold, letterSpacing: 0.3 },
  btn_text_primary: { color: Colors.white },
  btn_text_secondary: { color: Colors.white },
  btn_text_outline: { color: Colors.primary },
  btn_text_ghost: { color: Colors.primary },
  btn_text_danger: { color: Colors.white },
  btn_text_size_sm: { fontSize: Typography.sm },
  btn_text_size_md: { fontSize: Typography.base },
  btn_text_size_lg: { fontSize: Typography.md },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  badge_sm: { paddingHorizontal: 8, paddingVertical: 2 },
  badge_text: { fontSize: 12, fontWeight: Typography.medium },

  // Tag
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, marginRight: 6 },
  tag_text: { fontSize: Typography.xs, fontWeight: Typography.medium },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  empty_icon: { marginBottom: 16 },
  empty_title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  empty_sub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  // Section header
  section_header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  section_title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  section_action: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold },
});
