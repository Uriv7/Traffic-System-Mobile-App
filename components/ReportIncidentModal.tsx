import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MapPin, TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import { useIncidents } from '@/hooks/useIncidents';
import { MapView } from './MapView';

type ReportIncidentModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function ReportIncidentModal({ visible, onClose }: ReportIncidentModalProps) {
  const { reportIncident } = useIncidents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    severity: 'medium',
  });

  const handleSubmit = async () => {
    if (!location) {
      setError('Please select a location on the map');
      return;
    }

    if (!formData.type || !formData.title) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportIncident({
        ...formData,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
        status: 'active',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Traffic Incident</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={20} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.mapContainer}>
              <MapView
                showIncidents={false}
                onLocationSelect={(loc) => setLocation(loc)}
              />
              {location && (
                <View style={styles.locationPill}>
                  <MapPin size={16} color="#0066cc" />
                  <Text style={styles.locationText}>
                    Location selected
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type *</Text>
              <TextInput
                style={styles.input}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
                placeholder="e.g., Accident, Construction, Traffic Jam"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Brief description of the incident"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Additional details about the incident"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Severity</Text>
              <View style={styles.severityContainer}>
                {['low', 'medium', 'high'].map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityButton,
                      formData.severity === severity && styles.severityButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, severity })}>
                    <Text
                      style={[
                        styles.severityButtonText,
                        formData.severity === severity && styles.severityButtonTextActive,
                      ]}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Report Incident</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  locationPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0066cc',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#0066cc',
  },
  severityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  severityButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});