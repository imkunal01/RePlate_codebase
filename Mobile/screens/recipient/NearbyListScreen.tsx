import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../../services/foodService';
import { useLocationStore } from '../../store/locationStore';
import DonationCard from '../../components/DonationCard';
import EmptyState from '../../components/EmptyState';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function NearbyListScreen({ navigation }: any) {
  const { coordinates, getCurrentLocation } = useLocationStore();

  useEffect(() => {
    if (!coordinates) getCurrentLocation();
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby Food</Text>
          <Text style={styles.subtitle}>Within 10km of your location</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {!coordinates ? (
        <View style={styles.locationPrompt}>
          <Ionicons name="location-outline" size={40} color={Colors.primary} />
          <Text style={styles.locationTitle}>Location Required</Text>
          <Text style={styles.locationSub}>Allow location access to find nearby food donations</Text>
          <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
            <Text style={styles.locationBtnText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
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
              subtitle="Pull down to refresh. Donors in your area will be listed here."
            />
          }
          renderItem={({ item }: any) => (
            <DonationCard
              donation={item}
              onPress={() => navigation.navigate('DonationDetail', { donationId: item._id })}
              showStatusActions={false}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  locationPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.lg,
  },
  locationTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  locationSub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  locationBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  locationBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
});
