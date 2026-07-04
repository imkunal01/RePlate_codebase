import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { foodService } from '../../services/foodService';
import DonationCard from '../../components/DonationCard';
import EmptyState from '../../components/EmptyState';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function MyClaimsScreen({ navigation }: any) {
  const { data: donations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myClaims'],
    queryFn: foodService.getMine,
  });

  // Only show claimed donations for recipient view
  const myClaims = donations.filter((d: any) =>
    ['claimed', 'collected', 'completed'].includes(d.status)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Claims</Text>
        <Text style={styles.subtitle}>{myClaims.length} total claims</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : (
        <FlatList
          data={myClaims}
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
              icon="checkmark-circle-outline"
              title="No claims yet"
              subtitle="Go to the map or list view to find and claim nearby food donations"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
});
