import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, MapPin, Clock, ThumbsUp, Share2, Send, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useIncidents } from '@/hooks/useIncidents';

type IncidentDetailsModalProps = {
  visible: boolean;
  incident: any;
  onClose: () => void;
};

export function IncidentDetailsModal({
  visible,
  incident,
  onClose,
}: IncidentDetailsModalProps) {
  const { session } = useAuth();
  const { updateIncident } = useIncidents();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!incident) return null;

  const handleComment = async () => {
    if (!session) {
      setError('Please sign in to comment');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      const newComment = {
        id: Date.now().toString(),
        text: comment.trim(),
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      };

      await updateIncident(incident.id, {
        comments: [...(incident.comments || []), newComment],
      });

      setComment('');
      setError(null);
    } catch (err) {
      setError('Failed to post comment');
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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Incident Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Image
              source={{ uri: `https://source.unsplash.com/800x400/?traffic,${incident.type}` }}
              style={styles.image}
            />

            <View style={styles.detailsContainer}>
              <Text style={styles.incidentTitle}>{incident.title}</Text>

              <View style={styles.infoRow}>
                <MapPin size={16} color="#666" />
                <Text style={styles.infoText}>
                  {incident.location.coordinates.join(', ')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Clock size={16} color="#666" />
                <Text style={styles.infoText}>
                  {getTimeAgo(incident.created_at)}
                </Text>
              </View>

              {incident.description && (
                <Text style={styles.description}>{incident.description}</Text>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <ThumbsUp size={20} color="#0066cc" />
                  <Text style={styles.actionText}>
                    {incident.likes || 0} Likes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Share2 size={20} color="#0066cc" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments</Text>
                {incident.comments?.map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>User</Text>
                      <Text style={styles.commentTime}>
                        {getTimeAgo(comment.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.commentInput}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleComment}>
                <Send size={20} color="#0066cc" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 16,
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
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  incidentTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
  },
  commentsSection: {
    marginTop: 24,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  comment: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  commentInput: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    padding: 8,
  },
});