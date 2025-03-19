import { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useIncidents } from '@/hooks/useIncidents';

type MapViewProps = {
  mapType?: 'standard' | 'satellite';
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  showIncidents?: boolean;
  selectedLocation?: {
    lat: number;
    lng: number;
    name?: string;
  } | null;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
};

export function MapView({ 
  mapType = 'standard',
  onLocationSelect,
  showIncidents = true,
  selectedLocation,
  initialRegion 
}: MapViewProps) {
  const { incidents } = useIncidents();
  const [webViewContent, setWebViewContent] = useState('');

  useEffect(() => {
    // Generate map HTML with incidents if needed
    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
          <style>
            html, body, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById('map'), {
                center: ${selectedLocation 
                  ? `{ lat: ${selectedLocation.lat}, lng: ${selectedLocation.lng} }`
                  : `{ lat: ${initialRegion?.latitude || 37.7749}, lng: ${initialRegion?.longitude || -122.4194} }`
                },
                zoom: 12,
                mapTypeId: '${mapType}',
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
              });

              ${selectedLocation ? `
                new google.maps.Marker({
                  position: { lat: ${selectedLocation.lat}, lng: ${selectedLocation.lng} },
                  map,
                  title: '${selectedLocation.name || 'Selected Location'}',
                  animation: google.maps.Animation.DROP,
                });
              ` : ''}

              ${showIncidents ? `
                const incidents = ${JSON.stringify(incidents)};
                incidents.forEach(incident => {
                  const marker = new google.maps.Marker({
                    position: {
                      lat: incident.location.coordinates[1],
                      lng: incident.location.coordinates[0]
                    },
                    map,
                    title: incident.title,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: incident.severity === 'high' ? '#ff4444' : incident.severity === 'medium' ? '#ffbb33' : '#00c851',
                      fillOpacity: 0.7,
                      strokeWeight: 2,
                      strokeColor: '#fff',
                      scale: 10,
                    }
                  });

                  const infoWindow = new google.maps.InfoWindow({
                    content: \`
                      <div style="padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; font-family: sans-serif;">\${incident.title}</h3>
                        <p style="margin: 0; font-family: sans-serif; color: #666;">\${incident.description || ''}</p>
                      </div>
                    \`
                  });

                  marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                  });
                });
              ` : ''}

              ${onLocationSelect ? `
                map.addListener('click', (e) => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  }));
                });
              ` : ''}
            }
            initMap();
          </script>
        </body>
      </html>
    `;
    setWebViewContent(mapHtml);
  }, [incidents, showIncidents, initialRegion, selectedLocation, mapType]);

  if (Platform.OS === 'web') {
    return (
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50470.12082373011!2d-122.43853256072754!3d37.77492951655157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858080b3d5f8bb%3A0x2d147a23fbc5e254!2sSan%20Francisco%2C%20CA%2C%20USA!5e${mapType === 'satellite' ? '1' : '0'}!3m2!1sen!2s!4v1631234567890!5m2!1sen!2s`}
        style={{
          border: 0,
          width: '100%',
          height: '100%',
        }}
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html: webViewContent }}
        onMessage={(event) => {
          if (onLocationSelect) {
            const location = JSON.parse(event.nativeEvent.data);
            onLocationSelect(location);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});