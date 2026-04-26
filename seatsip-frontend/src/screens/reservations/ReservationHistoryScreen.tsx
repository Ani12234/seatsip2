import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function ReservationHistoryScreen() {
  const reservations = [
    { id: '1', venue: 'The Leela Palace', date: '28 Apr 2026', time: '7:30 PM', guests: 4, status: 'Confirmed', type: 'Dining' },
    { id: '2', venue: 'Taj Lands End', date: '02 May 2026', time: '8:00 PM', guests: 2, status: 'Pending', type: 'Dining' },
    { id: '3', venue: 'Blue Frog', date: '15 Apr 2026', time: '9:00 PM', guests: 6, status: 'Completed', type: 'Event' },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Confirmed': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Pending': return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'Completed': return { bg: '#ECEFF1', text: '#546E7A' };
      default: return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Reservations</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {reservations.map((res) => {
          const style = getStatusStyle(res.status);
          return (
            <View key={res.id} style={styles.reservationCard}>
              <View style={styles.resHeader}>
                <View style={styles.resIconBox}>
                  <Text>{res.type === 'Dining' ? '🍽️' : '🎵'}</Text>
                </View>
                <View style={styles.resInfo}>
                  <Text style={styles.resVenue}>{res.venue}</Text>
                  <Text style={styles.resMeta}>{res.type} • {res.guests} Guests</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                  <Text style={[styles.statusText, { color: style.text }]}>{res.status}</Text>
                </View>
              </View>
              
              <View style={styles.resDetails}>
                <View style={styles.resDetailItem}>
                  <Text style={styles.resDetailLabel}>Date</Text>
                  <Text style={styles.resDetailValue}>{res.date}</Text>
                </View>
                <View style={styles.resDetailItem}>
                  <Text style={styles.resDetailLabel}>Time</Text>
                  <Text style={styles.resDetailValue}>{res.time}</Text>
                </View>
              </View>
              
              {res.status !== 'Completed' && (
                <View style={styles.resActions}>
                  <TouchableOpacity style={styles.resActionBtn}>
                    <Text style={styles.resActionText}>Modify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.resActionBtn, styles.resActionBtnDanger]}>
                    <Text style={styles.resActionTextDanger}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  reservationCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16 },
  resHeader: { flexDirection: 'row', alignItems: 'center' },
  resIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F0EB', alignItems: 'center', justifyContent: 'center' },
  resInfo: { flex: 1, marginLeft: 12 },
  resVenue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  resMeta: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  resDetails: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  resDetailItem: { flex: 1 },
  resDetailLabel: { fontSize: 12, color: '#9E9E9E', marginBottom: 4 },
  resDetailValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  resActions: { flexDirection: 'row', marginTop: 16, gap: 10 },
  resActionBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  resActionBtnDanger: { borderColor: '#FFCDD2', backgroundColor: '#FFEBEE' },
  resActionText: { fontSize: 14, fontWeight: '600', color: '#5D4037' },
  resActionTextDanger: { fontSize: 14, fontWeight: '600', color: '#C62828' },
});
