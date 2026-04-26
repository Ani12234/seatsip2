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

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

export default function HelpCenterScreen() {
  const faqs = [
    { q: 'How do I track my order?', a: 'You can track your order in real-time from the My Orders section.' },
    { q: 'How do I cancel a reservation?', a: 'Go to Reservations, select your booking and tap Cancel.' },
    { q: 'How do I redeem points?', a: 'Points are auto-applied at checkout on eligible orders.' },
    { q: 'What payment methods are accepted?', a: 'We accept UPI, Cards, Net Banking and Wallet.' },
  ];
  
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Help Center</Text>
      
      <View style={styles.searchBar}>
        <Text>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search for help..." />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="POPULAR TOPICS" />
        <View style={styles.helpGrid}>
          {['Orders', 'Payments', 'Reservations', 'Account'].map((topic, idx) => (
            <TouchableOpacity key={idx} style={styles.helpTopic}>
              <Text style={styles.helpTopicIcon}>{['📦', '💳', '📅', '👤'][idx]}</Text>
              <Text style={styles.helpTopicText}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <SectionHeader title="FAQs" />
        {faqs.map((faq, idx) => (
          <View key={idx}>
            <TouchableOpacity style={styles.faqItem} onPress={() => setOpenIndex(openIndex === idx ? null : idx)}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqArrow}>{openIndex === idx ? '▾' : '▸'}</Text>
            </TouchableOpacity>
            {openIndex === idx && (
              <View style={styles.faqAnswerBox}>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            )}
            <Divider />
          </View>
        ))}
        
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportSubtitle}>Our support team is available 24/7</Text>
          <TouchableOpacity style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1A1A1A' },
  helpGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  helpTopic: { width: '47%', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  helpTopicIcon: { fontSize: 22 },
  helpTopicText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1A1A1A', paddingRight: 12 },
  faqArrow: { fontSize: 16, color: '#9E9E9E' },
  faqAnswerBox: { paddingHorizontal: 20, paddingBottom: 16 },
  faqAnswer: { fontSize: 14, color: '#616161', lineHeight: 22 },
  supportCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 24, marginBottom: 20, borderRadius: 16, padding: 24, alignItems: 'center' },
  supportTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  supportSubtitle: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
  supportBtn: { backgroundColor: '#3E2723', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  supportBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
