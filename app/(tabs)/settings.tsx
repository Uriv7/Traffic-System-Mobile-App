import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Clock, Moon, Shield, Car, Map, ChevronRight, LogOut, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AuthModal } from '@/components/AuthModal';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { profile, loading, error, updateProfile } = useProfile();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    nearbyIncidents: true,
    avoidTolls: false,
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.errorTitle}>Error Loading Profile</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : !session ? (
          <View style={styles.signInContainer}>
            <Text style={styles.signInTitle}>Sign In Required</Text>
            <Text style={styles.signInText}>
              Please sign in to access your profile and settings
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => setAuthModalVisible(true)}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' }}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.profileName}>{profile?.username || 'User'}</Text>
                <Text style={styles.profileEmail}>{session.user.email}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <Bell size={20} color="#666" />
                  <Text style={styles.settingText}>Traffic Alerts</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={() => handleSettingChange('notifications')}
                  trackColor={{ false: '#e5e5e5', true: '#0066cc' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <MapPin size={20} color="#666" />
                  <Text style={styles.settingText}>Nearby Incidents</Text>
                </View>
                <Switch
                  value={settings.nearbyIncidents}
                  onValueChange={() => handleSettingChange('nearbyIncidents')}
                  trackColor={{ false: '#e5e5e5', true: '#0066cc' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display</Text>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <Moon size={20} color="#666" />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => handleSettingChange('darkMode')}
                  trackColor={{ false: '#e5e5e5', true: '#0066cc' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <Map size={20} color="#666" />
                  <Text style={styles.settingText}>Default Map Type</Text>
                </View>
                <TouchableOpacity style={styles.optionButton}>
                  <Text style={styles.optionText}>Standard</Text>
                  <ChevronRight size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Navigation</Text>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <Clock size={20} color="#666" />
                  <Text style={styles.settingText}>Avoid Toll Roads</Text>
                </View>
                <Switch
                  value={settings.avoidTolls}
                  onValueChange={() => handleSettingChange('avoidTolls')}
                  trackColor={{ false: '#e5e5e5', true: '#0066cc' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.setting}>
                <View style={styles.settingLeft}>
                  <Car size={20} color="#666" />
                  <Text style={styles.settingText}>Vehicle Type</Text>
                </View>
                <TouchableOpacity style={styles.optionButton}>
                  <Text style={styles.optionText}>Car</Text>
                  <ChevronRight size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.settingLeft}>
                  <Shield size={20} color="#666" />
                  <Text style={styles.settingText}>Privacy Settings</Text>
                </View>
                <ChevronRight size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#ff4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </>
        )}
      </ScrollView>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
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
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  content: {
    flex: 1,
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
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  signInTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
  },
  signInText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    
    fontFamily: 'Inter-SemiBold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  editButton: {
    marginLeft: 'auto',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ff4444',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});