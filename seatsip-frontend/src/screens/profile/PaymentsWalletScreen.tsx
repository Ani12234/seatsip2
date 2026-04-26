import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function PaymentsWalletScreen() {
  const methods = [
    { id: '1', type: 'visa', last4: '4242', expiry: '12/27', default: true },
    { id: '2', type: 'mastercard', last4: '8888', expiry: '09/26', default: false },
  ];
  
  const transactions = [
    { id: '1', title: 'Added Money', amount: '+₹500', date: 'Today', type: 'credit' },
    { id: '2', title: 'Order #1234', amount: '-₹1,240', date: 'Yesterday', type: 'debit' },
    { id: '3', title: 'Cashback Earned', amount: '+₹45', date: '22 Apr', type: 'credit' },
    { id: '4', title: 'Order #1230', amount: '-₹689', date: '20 Apr', type: 'debit' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Payments & Wallet</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>₹101</Text>
          <Text style={styles.walletPoints}>186 Points available</Text>
          <TouchableOpacity style={styles.addMoneyBtn}>
            <Text style={styles.addMoneyText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>
        
        <SectionHeader title="PAYMENT METHODS" />
        {methods.map((method) => (
          <View key={method.id} style={styles.paymentMethod}>
            <Text style={styles.cardIcon}>💳</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{method.type.toUpperCase()} •••• {method.last4}</Text>
              <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
            </View>
            {method.default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
            <Text style={styles.arrow}>→</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addMethodBtn}>
          <Text style={styles.addMethodText}>+ Add New Card</Text>
        </TouchableOpacity>
        
        <SectionHeader title="RECENT TRANSACTIONS" />
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txItem}>
            <View style={styles.txIconBox}>
              <Text>{tx.type === 'credit' ? '⬇️' : '⬆️'}</Text>
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' ? styles.txCredit : styles.txDebit]}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  walletCard: { backgroundColor: '#3E2723', marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 8 },
  walletLabel: { color: '#BCAAA4', fontSize: 14, fontWeight: '500' },
  walletAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 6 },
  walletPoints: { color: '#BCAAA4', fontSize: 14, marginTop: 4 },
  addMoneyBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 18 },
  addMoneyText: { color: '#3E2723', fontWeight: '700', fontSize: 14 },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#fff' },
  cardIcon: { fontSize: 24, marginRight: 14 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  cardExpiry: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  defaultText: { fontSize: 11, color: '#2E7D32', fontWeight: '600' },
  arrow: { fontSize: 18, color: '#BDBDBD' },
  addMethodBtn: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderWidth: 1.5, borderColor: '#3E2723', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center' },
  addMethodText: { color: '#3E2723', fontWeight: '700', fontSize: 14 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  txIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  txDate: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txCredit: { color: '#2E7D32' },
  txDebit: { color: '#1A1A1A' },
});
