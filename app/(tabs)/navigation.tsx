import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Navigation2, Clock, Star, ChevronRight, Trash2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useRoutes } from '@/hooks/useRoutes';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { SaveRouteModal } from '@/components/SaveRouteModal';
import { MapView } from '@/components/MapView';

export default function NavigationScreen() {
  const { routes, loading, error, deleteRoute } = useRoutes();
  const { session } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<{
    start?: { lat: number; lng: number };
    end?: { lat: number; lng: number };
  }>({});

  const handleStartNavigation = () => {
    if (!session) {
      setAuthModalVisible(true);
      return;
    }

    if (selectedLocations.start && selectedLocations.end) {
      setSaveModalVisible(true);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorTitle}>Error Loading Routes</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Navigation</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a location..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            showIncidents={true}
            onLocationSelect={(location) => {
              if (!selectedLocations.start) {
                setSelectedLocations({ ...selectedLocations, start: location });
              } else if (!selectedLocations.end) {
                setSelectedLocations({ ...selectedLocations, end: location });
              }
            }}
          />
          {(selectedLocations.start || selectedLocations.end) && (
            <View style={styles.selectedLocations}>
              {selectedLocations.start && (
                <View style={styles.locationPill}>
                  <Text style={styles.locationLabel}>Start</Text>
                  <Text style={styles.locationCoords}>
                    {selectedLocations.start.lat.toFixed(6)}, {selectedLocations.start.lng.toFixed(6)}
                  </Text>
                </View>
              )}
              {selectedLocations.end && (
                <View style={styles.locationPill}>
                  <Text style={styles.locationLabel}>End</Text>
                  <Text style={styles.locationCoords}>
                    {selectedLocations.end.lat.toFixed(6)}, {selectedLocations.end.lng.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            (!selectedLocations.start || !selectedLocations.end) && styles.startButtonDisabled
          ]}
          onPress={handleStartNavigation}
          disabled={!selectedLocations.start || !selectedLocations.end}>
          <Text style={styles.startButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#666" />
            <Text style={styles.sectionTitle}>Saved Routes</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.loadingText}>Loading routes...</Text>
            </View>
          ) : routes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Star size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Saved Routes</Text>
              <Text style={styles.emptyText}>
                Save your favorite routes for quick access
              </Text>
            </View>
          ) : (
            routes.map((route) => (
              <TouchableOpacity key={route.id} style={styles.routeCard}>
                <Image
                  source={{ uri: `https://source.unsplash.com/400x300/?city,route` }}
                  style={styles.routeImage}
                />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeDetails}>
                    Created {new Date(route.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteRoute(route.id)}>
                  <Trash2 size={20} color="#ff4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {selectedLocations.start && selectedLocations.end && (
        <SaveRouteModal
          visible={saveModalVisible}
          onClose={() => setSaveModalVisible(false)}
          startLocation={selectedLocations.start}
          endLocation={selectedLocations.end}
        />
      )}
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
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  selectedLocations: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  locationPill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
  },
  locationCoords: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  startButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
});