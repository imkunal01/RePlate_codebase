import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import Constants from 'expo-constants';
import { foodService } from '../../services/foodService';
import { useLocationStore } from '../../store/locationStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { MAP_CONFIG } from '../../constants/api';

// Check if Android Google Maps API Key is configured in app.json
// If it's missing, rendering MapView on Android will cause a fatal native crash.
const hasAndroidMapKey = !!Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
const canRenderMap = Platform.OS !== 'android' || hasAndroidMapKey;

export default function MapScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const { coordinates, address, getCurrentLocation, isLoading: locationLoading } = useLocationStore();
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(!canRenderMap);

  useEffect(() => {
    if (!coordinates) {
      getCurrentLocation();
    }
  }, []);

  const { data: donations = [], isLoading, refetch } = useQuery({
    queryKey: ['nearbyFood', coordinates?.latitude, coordinates?.longitude],
    queryFn: () =>
      coordinates
        ? foodService.getNearby(coordinates.latitude, coordinates.longitude)
        : Promise.resolve([]),
    enabled: !!coordinates,
    refetchInterval: 60 * 1000,
  });

  // Center map when coordinates are available
  useEffect(() => {
    if (coordinates && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [coordinates, mapReady]);

  const handleMarkerPress = (donationId: string) => {
    navigation.navigate('DonationDetail', { donationId });
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <View style={StyleSheet.absoluteFill}>
        {mapError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.errorTitle}>Map Unavailable</Text>
            <Text style={styles.errorDesc}>
              Google Maps API key is missing from app.json configuration. Please configure it to view the map.
            </Text>
          </View>
        ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={MAP_CONFIG.initialRegion}
          showsUserLocation={!!coordinates}
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
          customMapStyle={mapStyle}
        >
          {donations.map((donation: any) => (
            <Marker
              key={donation._id}
              coordinate={{
                latitude: donation.location.coordinates[1],
                longitude: donation.location.coordinates[0],
              }}
              title={donation.name}
              description={`${donation.quantity.amount} ${donation.quantity.unit}`}
              pinColor={MAP_CONFIG.donationPinColor}
              onCalloutPress={() => handleMarkerPress(donation._id)}
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{donation.name}</Text>
                  <Text style={styles.calloutDesc}>
                    {donation.quantity.amount} {donation.quantity.unit} • {donation.type}
                  </Text>
                  <Text style={styles.calloutAction}>Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        )}
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Nearby Food</Text>
              <Text style={styles.subtitle}>
                {isLoading
                  ? 'Finding donations…'
                  : coordinates
                  ? `${donations.length} available within 10km`
                  : 'Enable location to find food'}
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Location Bar */}
          <TouchableOpacity 
            style={styles.locationBar} 
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            <Ionicons 
              name={coordinates ? "location" : "location-outline"} 
              size={16} 
              color={coordinates ? Colors.primary : Colors.textMuted} 
            />
            <Text style={[styles.locationText, !coordinates && { color: Colors.textMuted }]} numberOfLines={1}>
              {locationLoading 
                ? 'Getting location…' 
                : address || (coordinates 
                    ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                    : 'Tap to enable location')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Floating Locate Button */}
      <SafeAreaView style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            if (coordinates && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            } else {
              getCurrentLocation();
            }
          }}
        >
          <Ionicons name="locate" size={24} color={Colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// Optional: Minimal dark theme map style to match the app
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#212121"}]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#212121"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9e9e9e"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#bdbdbd"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#181818"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#1b1b1b"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#2c2c2c"}]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#8a8a8a"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{"color": "#373737"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#3c3c3c"}]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{"color": "#4e4e4e"}]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#616161"}]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#000000"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#3d3d3d"}]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  calloutContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: 200,
    ...Shadow.sm,
  },
  calloutTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  calloutAction: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  errorTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
