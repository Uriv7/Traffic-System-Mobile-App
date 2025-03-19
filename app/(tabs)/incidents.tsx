import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TriangleAlert as AlertTriangle, Construction, Car, MapPin, Clock, ChevronRight, CircleAlert as AlertCircle, Share2, ThumbsUp, MessageCircle } from 'lucide-react-native';
import { useIncidents } from '@/hooks/useIncidents';
import { ReportIncidentModal } from '@/components/ReportIncidentModal';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { IncidentDetailsModal } from '@/components/IncidentDetailsModal';

export default function IncidentsScreen() {
  const { incidents, loading, error, updateIncident } = useIncidents();
  const { session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Wait for 1 second to simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleReportPress = () => {
    if (!session) {
      setAuthModalVisible(true);
    } else {
      setReportModalVisible(true);
    }
  };

  const handleShare = async (incident) => {
    try {
      const shareText = `Traffic Incident Alert: ${incident.title} at ${incident.location.coordinates.join(', ')}`;
      if (Platform.OS === 'web') {
        await navigator.share({ text: shareText });
      } else {
        // For native platforms, implement share functionality
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = async (incident) => {
    if (!session) {
      setAuthModalVisible(true);
      return;
    }
    try {
      await updateIncident(incident.id, {
        likes: (incident.likes || 0) + 1
      });
    } catch (error) {
      console.error('Error liking incident:', error);
    }
  };

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    setDetailsModalVisible(true);
  };

  const getIncidentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'construction':
        return <Construction size={20} color="#666" />;
      case 'traffic':
        return <Car size={20} color="#666" />;
      default:
        return <AlertTriangle size={20} color="#666" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      default:
        return '#00c851';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorTitle}>Error Loading Incidents</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Traffic Incidents</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Implement filter functionality */}}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0066cc"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading incidents...</Text>
          </View>
        ) : incidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={48} color="#666" />
            <Text style={styles.emptyTitle}>No Incidents Reported</Text>
            <Text style={styles.emptyText}>The roads are clear! Tap the button below to report any new incidents.</Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <TouchableOpacity 
              key={incident.id} 
              style={styles.incident}
              onPress={() => handleIncidentPress(incident)}
            >
              <View style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(incident.severity) }
              ]} />
              <Image
                source={{ uri: `https://source.unsplash.com/400x300/?traffic,${incident.type}` }}
                style={styles.incidentImage}
              />
              <View style={styles.incidentContent}>
                <View style={styles.incidentHeader}>
                  {getIncidentIcon(incident.type)}
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.incidentLocation}>
                    {incident.location.coordinates.join(', ')}
                  </Text>
                </View>
                {incident.description && (
                  <Text 
                    style={styles.incidentDetails}
                    numberOfLines={2}
                  >
                    {incident.description}
                  </Text>
                )}
                <View style={styles.incidentFooter}>
                  <View style={styles.timeContainer}>
                    <Clock size={16} color="#999" />
                    <Text style={styles.incidentTime}>
                      {getTimeAgo(incident.created_at)}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleLike(incident)}
                    >
                      <ThumbsUp size={16} color="#666" />
                      <Text style={styles.actionButtonText}>
                        {incident.likes || 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleIncidentPress(incident)}
                    >
                      <MessageCircle size={16} color="#666" />
                      <Text style={styles.actionButtonText}>
                        {incident.comments?.length || 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleShare(incident)}
                    >
                      <Share2 size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleReportPress}
        >
          <AlertTriangle size={20} color="#fff" />
          <Text style={styles.reportButtonText}>Report New Incident</Text>
        </TouchableOpacity>
      </ScrollView>

      <ReportIncidentModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      <IncidentDetailsModal
        visible={detailsModalVisible}
        incident={selectedIncident}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedIncident(null);
        }}
      />
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
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  incident: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
  },
  severityIndicator: {
    width: 4,
    height: '100%',
    marginRight: 12,
  },
  incidentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  incidentContent: {
    flex: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  incidentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  incidentLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  incidentDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});