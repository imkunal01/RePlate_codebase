import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { foodService } from '../../services/foodService';
import DonationCard from '../../components/DonationCard';
import EmptyState from '../../components/EmptyState';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function DonorHistoryScreen() {
  const { data: donations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myDonations'],
    queryFn: foodService.getMine,
  });

  const history = donations.filter((d: any) => ['completed', 'expired'].includes(d.status));
  const totalMeals = history
    .filter((d: any) => d.status === 'completed')
    .reduce((sum: number, d: any) => sum + (d.quantity?.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Donation History</Text>
        <View style={styles.impactCard}>
          <Text style={styles.impactLabel}>Total Meals Donated</Text>
          <Text style={styles.impactNumber}>{totalMeals.toLocaleString()}</Text>
          <Text style={styles.impactSub}>across {history.length} donations</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No completed donations yet"
              subtitle="Your completed and expired donations will appear here"
            />
          }
          renderItem={({ item }) => (
            <DonationCard donation={item} onPress={() => {}} showStatusActions={false} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  impactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  impactLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  impactNumber: { fontSize: 48, fontWeight: '900', color: Colors.primary, marginVertical: 4 },
  impactSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
});
