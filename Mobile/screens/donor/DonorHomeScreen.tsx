import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { foodService } from '../../services/foodService';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import DonationCard from '../../components/DonationCard';
import EmptyState from '../../components/EmptyState';

export default function DonorHomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: donations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myDonations'],
    queryFn: foodService.getMine,
  });

  // Active donations (not completed/expired)
  const activeDonations = donations.filter(
    (d: any) => !['completed', 'expired'].includes(d.status)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </Text>
          <Text style={styles.subtitle}>Your active donations</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeDonations.length} active</Text>
          </View>
        </View>
      </View>

      {/* Impact banner */}
      <View style={styles.impactBanner}>
        <Ionicons name="leaf" size={20} color={Colors.secondary} />
        <Text style={styles.impactText}>
          You've donated{' '}
          <Text style={styles.impactNumber}>{donations.length}</Text> times. Keep it up! 🌱
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: Spacing.xxxl }}
        />
      ) : (
        <FlatList
          data={activeDonations}
          keyExtractor={(item) => item._id}
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
              title="No active donations"
              subtitle="Tap the orange + button below to donate food right now"
            />
          }
          renderItem={({ item }) => (
            <DonationCard
              donation={item}
              onPress={() => {}}
              showStatusActions
              onStatusUpdate={async (status: string) => {
                try {
                  await foodService.updateStatus(item._id, status as any);
                  queryClient.invalidateQueries({ queryKey: ['myDonations'] });
                  Toast.show({ type: 'success', text1: `Donation marked as ${status}` });
                } catch {
                  Toast.show({ type: 'error', text1: 'Failed to update status' });
                }
              }}
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
  greeting: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  badge: {
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
  impactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.secondary}15`,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.secondary}30`,
  },
  impactText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  impactNumber: { color: Colors.secondary, fontWeight: '800' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
});
