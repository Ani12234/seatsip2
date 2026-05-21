// components/CitySelector.js
// All-India city picker modal

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function CitySelector({ visible, cities, currentCity, onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Group cities by state
  const groupedCities = React.useMemo(() => {
    const filtered = cities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const groups = {};
    filtered.forEach(city => {
      if (!groups[city.state]) groups[city.state] = [];
      groups[city.state].push(city);
    });
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [cities, searchQuery]);

  const renderCity = ({ item: city }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        currentCity?.id === city.id && styles.cityItemActive
      ]}
      onPress={() => {
        onSelect(city);
        setSearchQuery('');
      }}
    >
      <Text style={[
        styles.cityName,
        currentCity?.id === city.id && styles.cityNameActive
      ]}>
        {city.name}
      </Text>
      {currentCity?.id === city.id && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderSection = ({ item: [state, stateCities] }) => (
    <View style={styles.section}>
      <Text style={styles.stateHeader}>{state}</Text>
      {stateCities.map(city => (
        <View key={city.id}>
          {renderCity({ item: city })}
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select City</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search city or state..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Current Location */}
          <View style={styles.currentContainer}>
            <Text style={styles.currentLabel}>CURRENT LOCATION</Text>
            <TouchableOpacity style={styles.currentCity} onPress={onClose}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.currentCityName}>{currentCity?.name}</Text>
              <Text style={styles.currentCitySub}>{currentCity?.state}</Text>
            </TouchableOpacity>
          </View>

          {/* City List */}
          <FlatList
            data={groupedCities}
            renderItem={renderSection}
            keyExtractor={([state]) => state}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0D1B2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    color: '#888',
    fontSize: 14,
    padding: 4,
  },
  currentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currentLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentCity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230,57,70,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  currentCityName: {
    color: '#E63946',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentCitySub: {
    color: '#888',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  stateHeader: {
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  cityItemActive: {
    backgroundColor: 'rgba(230,57,70,0.15)',
  },
  cityName: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  cityNameActive: {
    color: '#E63946',
    fontWeight: '600',
  },
  checkmark: {
    color: '#E63946',
    fontSize: 16,
    fontWeight: '700',
  },
});
