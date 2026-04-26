import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button } from '../../components/ui';
import { GoogleButton } from '../../components/ui/GoogleButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Name, email and password are required.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password, phone || undefined);
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('Registration failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>☕ SeatSip</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join thousands of café lovers</Text>

          {[
            { label: 'Full Name', value: name, setter: setName, placeholder: 'Arjun Sharma', type: 'default' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'arjun@example.com', type: 'email-address' },
            { label: 'Phone (optional)', value: phone, setter: setPhone, placeholder: '+91-9876543210', type: 'phone-pad' },
            { label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', type: 'default', secure: true },
          ].map(f => (
            <View key={f.label} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.setter as any}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={f.type as any}
                autoCapitalize={f.type === 'default' && !f.secure ? 'words' : 'none'}
                secureTextEntry={f.secure}
              />
            </View>
          ))}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
          
          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleButton onPress={() => {}} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.base },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 36 },
  logo: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.primary },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.md },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.md },
  label: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: Typography.base, color: Colors.textPrimary, backgroundColor: Colors.background,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { marginHorizontal: 12, fontSize: Typography.sm, color: Colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: Typography.base, color: Colors.textSecondary },
  footerLink: { fontSize: Typography.base, color: Colors.accent, fontWeight: Typography.bold },
});
