import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, Search, Navigation2, MapPin, Clock, Star, Settings, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useIncidents } from '@/hooks/useIncidents';
import { useRoutes } from '@/hooks/useRoutes';
import { MapView } from '@/components/MapView';

export default function MapScreen() {
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { incidents } = useIncidents();
  const { routes } = useRoutes();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);

  // Mock search results
  const searchResults = [
    { id: 1, name: 'San Francisco City Hall', lat: 37.7793, lng: -122.4193 },
    { id: 2, name: 'Golden Gate Bridge', lat: 37.8199, lng: -122.4783 },
    { id: 3, name: 'Fisherman\'s Wharf', lat: 37.8080, lng: -122.4177 },
  ].filter(result => 
    result.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setShowSearchResults(!!text);
  };

  const handleLocationSelect = (location: typeof searchResults[0]) => {
    setSelectedLocation(location);
    setShowSearchResults(false);
    setSearchQuery(location.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Traffic</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.mapTypeButton}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Layers size={20} color="#0066cc" />
            <Text style={styles.mapTypeText}>{mapType === 'standard' ? 'Satellite' : 'Standard'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search location..."
            placeholderTextColor="#666"
          />
          {searchQuery && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {showSearchResults && (
          <ScrollView style={styles.searchResults}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.searchResult}
                onPress={() => handleLocationSelect(result)}
              >
                <MapPin size={16} color="#666" />
                <Text style={styles.searchResultText}>{result.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          mapType={mapType}
          showIncidents={true}
          selectedLocation={selectedLocation}
        />

        {incidents.length > 0 && (
          <View style={styles.incidentOverlay}>
            <View style={styles.incidentPill}>
              <AlertTriangle size={16} color="#ff4444" />
              <Text style={styles.incidentText}>
                {incidents.length} Active Incidents
              </Text>
            </View>
          </View>
        )}

        {routes.length > 0 && (
          <ScrollView
            horizontal
            style={styles.quickRoutes}
            showsHorizontalScrollIndicator={false}
          >
            {routes.map((route) => (
              <TouchableOpacity key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.routeName}>{route.name}</Text>
                </View>
                <View style={styles.routeDetails}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.routeTime}>25 min</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navigationButton}>
          <Navigation2 size={24} color="#fff" />
          <Text style={styles.navigationButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  mapTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  searchResults: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchResultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  incidentOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  incidentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  incidentText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ff4444',
  },
  quickRoutes: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 150,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  routeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});