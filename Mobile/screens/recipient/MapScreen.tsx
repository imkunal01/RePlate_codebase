import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../services/foodService';
import { useLocationStore } from '../../store/locationStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import DonationCard from '../../components/DonationCard';
import EmptyState from '../../components/EmptyState';

export default function MapScreen({ navigation }: any) {
  const { coordinates, address, getCurrentLocation, isLoading: locationLoading } = useLocationStore();

  useEffect(() => {
    if (!coordinates) {
      getCurrentLocation();
    }
  }, []);

  const { data: donations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['nearbyFood', coordinates?.latitude, coordinates?.longitude],
    queryFn: () =>
      coordinates
        ? foodService.getNearby(coordinates.latitude, coordinates.longitude)
        : Promise.resolve([]),
    enabled: !!coordinates,
    refetchInterval: 60 * 1000,
  });

  const openInMaps = () => {
    if (!coordinates) return;
    const url = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
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
            <Ionicons name="refresh" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Location bar */}
        {coordinates ? (
          <TouchableOpacity style={styles.locationBar} onPress={openInMaps}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {address || `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`}
            </Text>
            <Ionicons name="open-outline" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.locationBar} onPress={getCurrentLocation}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
            <Text style={[styles.locationText, { color: Colors.textMuted }]}>
              {locationLoading ? 'Getting location…' : 'Tap to enable location'}
            </Text>
            {locationLoading && <ActivityIndicator size="small" color={Colors.primary} />}
          </TouchableOpacity>
        )}

        {/* Dev info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="map-outline" size={14} color={Colors.info} />
          <Text style={styles.infoText}>
            Interactive map available in development build
          </Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      {!coordinates ? (
        <View style={styles.locationPrompt}>
          <View style={styles.locationIconBg}>
            <Ionicons name="location-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.promptTitle}>Location Required</Text>
          <Text style={styles.promptSub}>
            Allow location access to discover food donations near you
          </Text>
          <TouchableOpacity style={styles.enableBtn} onPress={getCurrentLocation}>
            <Ionicons name="navigate" size={18} color={Colors.white} />
            <Text style={styles.enableBtnText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching nearby donations…</Text>
        </View>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-outline"
              title="No food nearby right now"
              subtitle="Pull down to refresh or check back soon — donors in your area will appear here."
            />
          }
          renderItem={({ item }: any) => (
            <DonationCard
              donation={item}
              onPress={() =>
                navigation.navigate('DonationDetail', { donationId: item._id })
              }
              showStatusActions={false}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: '500',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.info}10`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: `${Colors.info}25`,
  },
  infoText: {
    fontSize: FontSize.xs - 1,
    color: Colors.info,
    flex: 1,
  },
  locationPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.lg,
  },
  locationIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  promptTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  enableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadow.primary,
  },
  enableBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.md },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});
