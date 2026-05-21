import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import AppIcon from '../ui/AppIcon';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇦' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'ar', label: 'Arabic', flag: '🇦🇪' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
];

type Language = typeof LANGUAGES[0];

interface LanguageSelectModalProps {
  visible: boolean;
  selectedLang: Language;
  onClose: () => void;
  onSelect: (lang: Language) => void;
}

export const LanguageSelectModal = ({ visible, selectedLang, onClose, onSelect }: LanguageSelectModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalDismiss} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.langModalContent}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={onClose}>
              <AppIcon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.langItem,
                  selectedLang.code === item.code && styles.langItemActive
                ]}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[
                  styles.langLabel,
                  selectedLang.code === item.code && styles.langLabelActive
                ]}>
                  {item.label}
                </Text>
                {selectedLang.code === item.code && (
                  <AppIcon name="check" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.langList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  langModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0D8D0',
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  langList: {
    padding: 16,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 16,
  },
  langItemActive: {
    backgroundColor: '#F5F5F5',
  },
  langFlag: {
    fontSize: 24,
  },
  langLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  langLabelActive: {
    color: '#1A1A1A',
    fontWeight: '800',
  },
});
