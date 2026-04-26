import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';

export default function EditProfileScreen() {
  const [form, setForm] = useState({
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Edit Profile</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarEditSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>A</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm({...form, name: t})}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              keyboardType="email-address"
              onChangeText={(t) => setForm({...form, email: t})}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              keyboardType="phone-pad"
              onChangeText={(t) => setForm({...form, phone: t})}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(t) => setForm({...form, location: t})}
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  avatarEditSection: { alignItems: 'center', marginVertical: 24 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#C8956C', alignItems: 'center', justifyContent: 'center' },
  avatarTextLarge: { fontSize: 36, fontWeight: '700', color: '#fff' },
  changePhotoBtn: { marginTop: 12 },
  changePhotoText: { color: '#8B6F47', fontWeight: '600', fontSize: 14 },
  formCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#9E9E9E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingVertical: 8, fontSize: 16, color: '#1A1A1A' },
  primaryButton: { backgroundColor: '#3E2723', marginHorizontal: 20, marginTop: 24, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
