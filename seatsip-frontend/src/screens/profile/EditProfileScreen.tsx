import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { usersApi } from '../../services/api';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&h=240&fit=crop&crop=faces',
];

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, updateStoredUser, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: 'Mumbai, India',
    avatar: user?.avatar || '',
  });
  const avatarInitial = (form.name?.[0] || form.email?.[0] || 'U').toUpperCase();

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    }));
  }, [user]);

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setForm(prev => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  const saveProfile = async () => {
    const nextProfile = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar,
    };

    if (!nextProfile.name) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await usersApi.updateProfile(nextProfile);
      await updateStoredUser(data.data || nextProfile);
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      await updateStoredUser(nextProfile);
      Alert.alert('Saved locally', 'Profile photo was saved on this device. It will sync when the server is available.');
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F7F4" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Edit Profile</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarEditSection}>
          <View style={styles.avatarLarge}>
            {form.avatar ? (
              <Image source={{ uri: form.avatar }} style={styles.avatarImageLarge} />
            ) : (
              <Text style={styles.avatarTextLarge}>{avatarInitial}</Text>
            )}
            <View style={styles.cameraBadge}>
              <AppIcon name="photo" size={14} color="#fff" />
            </View>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.7} onPress={pickProfilePhoto}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.samplesCard}>
          <Text style={styles.samplesTitle}>Choose a sample</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleRow}>
            {SAMPLE_AVATARS.map(uri => {
              const isSelected = form.avatar === uri;
              return (
                <TouchableOpacity
                  key={uri}
                  style={[styles.sampleAvatarBtn, isSelected && styles.sampleAvatarBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setForm(prev => ({ ...prev, avatar: uri }))}
                >
                  <Image source={{ uri }} style={styles.sampleAvatarImage} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              placeholder="Enter your name"
              onChangeText={(t) => setForm({...form, name: t})}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={form.email}
              keyboardType="email-address"
              placeholder="Enter your email"
              autoCapitalize="none"
              editable={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
              onChangeText={(t) => setForm({...form, phone: t})}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              placeholder="Enter your city"
              onChangeText={(t) => setForm({...form, location: t})}
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={saveProfile} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F7F4' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: '#1A1A1A',
  },
  pageTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  avatarEditSection: { 
    alignItems: 'center', 
    marginVertical: 24 
  },
  avatarLarge: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#C8956C', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#C8956C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarImageLarge: {
    width: '100%',
    height: '100%',
  },
  avatarTextLarge: { 
    fontSize: 40, 
    fontWeight: '800', 
    color: '#fff' 
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3E2723',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F9F7F4',
  },
  cameraIcon: {
    fontSize: 14,
  },
  changePhotoBtn: { 
    marginTop: 16 
  },
  changePhotoText: { 
    color: '#8B6F47', 
    fontWeight: '700', 
    fontSize: 14 
  },
  samplesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    paddingLeft: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  samplesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B6F47',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sampleRow: {
    gap: 12,
    paddingRight: 16,
  },
  sampleAvatarBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 3,
    borderWidth: 2,
    borderColor: '#F0E6DB',
  },
  sampleAvatarBtnActive: {
    borderColor: '#3E2723',
  },
  sampleAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  formCard: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: { 
    marginBottom: 20 
  },
  inputLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#AAAAAA', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 1.2 
  },
  input: { 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#F0F0F0', 
    paddingVertical: 10, 
    fontSize: 16, 
    color: '#1A1A1A',
    fontWeight: '600',
  },
  inputDisabled: {
    color: '#777',
  },
  primaryButton: { 
    backgroundColor: '#3E2723', 
    marginHorizontal: 20, 
    marginTop: 32, 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: '#3E2723',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
