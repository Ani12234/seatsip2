import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  View,
} from 'react-native';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Terms & Conditions</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.termsScroll}>
        <Text style={styles.termsDate}>Last updated: April 2026</Text>
        
        <Text style={styles.termsSection}>1. Acceptance of Terms</Text>
        <Text style={styles.termsText}>
          By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>
        
        <Text style={styles.termsSection}>2. Use License</Text>
        <Text style={styles.termsText}>
          Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only.
        </Text>
        
        <Text style={styles.termsSection}>3. Account Responsibilities</Text>
        <Text style={styles.termsText}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </Text>
        
        <Text style={styles.termsSection}>4. Orders & Payments</Text>
        <Text style={styles.termsText}>
          All orders placed through the app are subject to availability and confirmation of the order price. We reserve the right to refuse any order without giving reasons.
        </Text>
        
        <Text style={styles.termsSection}>5. Cancellation Policy</Text>
        <Text style={styles.termsText}>
          Orders can be cancelled within 5 minutes of placement. Reservations must be cancelled at least 2 hours prior to the scheduled time.
        </Text>
        
        <Text style={styles.termsSection}>6. Limitation of Liability</Text>
        <Text style={styles.termsText}>
          In no event shall the app or its suppliers be liable for any damages arising out of the use or inability to use the materials on the app.
        </Text>
        
        <Text style={styles.termsSection}>7. Governing Law</Text>
        <Text style={styles.termsText}>
          These terms and conditions are governed by and construed in accordance with the laws of India.
        </Text>
        
        <View style={styles.termsFooter} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  termsScroll: { paddingHorizontal: 20 },
  termsDate: { fontSize: 13, color: '#9E9E9E', marginBottom: 20 },
  termsSection: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 20, marginBottom: 8 },
  termsText: { fontSize: 14, color: '#616161', lineHeight: 22 },
  termsFooter: { height: 40 },
});
