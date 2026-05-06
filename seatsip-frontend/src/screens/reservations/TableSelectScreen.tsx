import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { cafesApi } from "../../services/api";
import AppIcon from '../../components/ui/AppIcon';

const { width } = Dimensions.get('window');

type Route = RouteProp<RootStackParamList, 'TableSelect'>;

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 8, 10];
const TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

const SelectTableScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const cafeId = route.params?.cafeId;
  const cafeName = route.params?.cafeName || "Dyu Art Café";
  
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("19:00");
  const [floor, setFloor] = useState("Ground");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cafeId) {
      fetchTables();
    }
  }, [cafeId]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await cafesApi.getById(cafeId!);
      if (response.data.success && response.data.data.tables) {
        setTables(response.data.data.tables);
        // Find first available table that fits party size
        const firstMatch = response.data.data.tables.find((t: any) => t.capacity >= partySize);
        if (firstMatch) setSelectedTable(firstMatch.id);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedTable) return;
    navigation.navigate('ReservationDetails', {
      cafeId: cafeId,
      cafeName: cafeName,
      tableId: selectedTable,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AppIcon name="back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Select Table</Text>
          <Text style={styles.subtitle}>
            {cafeName} • Koramangala, Bengaluru
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Party Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Party Size</Text>
          <Text style={styles.sectionSub}>How many guests?</Text>

          <View style={styles.row}>
            {PARTY_SIZES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.circle,
                  partySize === item && styles.selectedCircle,
                ]}
                onPress={() => {
                  setPartySize(item);
                  // Reset selected table if it's too small
                  const currentTable = tables.find(t => t.id === selectedTable);
                  if (currentTable && currentTable.capacity < item) {
                    setSelectedTable(null);
                  }
                }}
              >
                <Text
                  style={[
                    styles.circleText,
                    partySize === item && styles.selectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <Text style={styles.sectionSub}>Choose your preferred time</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.timeBtn,
                  time === t && styles.selectedTime,
                ]}
                onPress={() => setTime(t)}
              >
                <Text
                  style={[
                    styles.timeText,
                    time === t && styles.selectedText,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Floor Selection */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Select Floor</Text>
            <View style={styles.floorRow}>
              {["Ground", "First"].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.floorBtnSmall,
                    floor === f && styles.selectedFloor,
                  ]}
                  onPress={() => setFloor(f)}
                >
                  <Text
                    style={[
                      styles.floorTextSmall,
                      floor === f && styles.selectedText,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Tables Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5E3C" />
            <Text style={styles.loadingText}>Fetching available tables...</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Tables</Text>
            <Text style={styles.sectionSub}>Select your preferred spot</Text>

            <View style={styles.tableGrid}>
              {tables
                .filter(t => t.floor === floor)
                .map((item) => {
                  const isSelected = selectedTable === item.id;
                  const isDisabled = item.capacity < partySize || item.is_available === 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      disabled={isDisabled}
                      style={[
                        styles.tableCard,
                        isSelected && styles.selectedTableCard,
                        isDisabled && styles.disabledTable,
                      ]}
                      onPress={() => setSelectedTable(item.id)}
                    >
                      <View style={styles.tableIconContainer}>
                        <AppIcon name="reservation" size={22} color={isSelected ? '#fff' : '#8B5E3C'} />
                      </View>
                      <Text style={[styles.tableId, isSelected && styles.selectedText]}>
                        Table {item.table_number}
                      </Text>
                      <Text style={[styles.tableSeats, isSelected && styles.selectedText]}>
                        {item.capacity} Seats
                      </Text>
                      {isDisabled && (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {item.is_available === 0 ? "Booked" : "Small"}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
            
            {tables.filter(t => t.floor === floor).length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tables available on this floor.</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedTable && styles.disabledContinue]}
          onPress={handleContinue}
          disabled={!selectedTable}
        >
          <Text style={styles.continueText}>Continue to Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const PRIMARY = "#8B5E3C"; // coffee brown
const BG = "#F7F5F2";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: '#1A1A1A',
  },

  subtitle: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: '#1A1A1A',
  },

  sectionSub: {
    color: "#8E8E93",
    fontSize: 13,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
  },

  selectedCircle: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  circleText: {
    color: "#333",
    fontWeight: '600',
  },

  selectedText: {
    color: "#fff",
  },

  timeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    backgroundColor: 'white',
  },

  selectedTime: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  timeText: {
    color: "#333",
    fontWeight: '600',
  },

  floorRow: {
    flexDirection: 'row',
    gap: 8,
  },

  floorBtnSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    backgroundColor: 'white',
  },

  selectedFloor: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  floorTextSmall: {
    color: "#333",
    fontSize: 13,
    fontWeight: '700',
  },

  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  tableCard: {
    width: (width - 60) / 3,
    margin: 5,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  selectedTableCard: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  disabledTable: {
    backgroundColor: "#F0F0F0",
    opacity: 0.5,
  },

  tableIconContainer: {
    marginBottom: 6,
  },

  tableIcon: {
    fontSize: 24,
  },

  tableId: {
    fontWeight: "800",
    fontSize: 13,
    color: '#1A1A1A',
  },

  tableSeats: {
    marginTop: 2,
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: '600',
  },

  statusBadge: {
    marginTop: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  statusText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },

  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#999',
  },

  continueBtn: {
    backgroundColor: PRIMARY,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  disabledContinue: {
    backgroundColor: '#D1D1D6',
    shadowOpacity: 0,
    elevation: 0,
  },

  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default SelectTableScreen;
