import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { foodService } from '../../services/foodService';
import { Colors, FontSize, Spacing, BorderRadius, Shadow, StatusConfig } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import ExpiryCountdown from '../../components/ExpiryCountdown';

export default function DonationDetailScreen({ route, navigation }: any) {
  const { donationId } = route.params;
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: () => foodService.getById(donationId),
  });

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await foodService.claim(donationId);
      queryClient.invalidateQueries({ queryKey: ['nearbyFood'] });
      queryClient.invalidateQueries({ queryKey: ['donation', donationId] });
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
      Toast.show({
        type: 'success',
        text1: '✅ Donation claimed!',
        text2: "The donor has been notified. Please collect the food soon.",
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to claim donation';
      Toast.show({ type: 'error', text1: 'Claim Failed', text2: msg });
    } finally {
      setClaiming(false);
    }
  };

  const openDirections = () => {
    if (!donation?.location?.coordinates) return;
    const [lon, lat] = donation.location.coordinates;
    const url = `https://maps.google.com/?q=${lat},${lon}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !donation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Donation not found</Text>
      </View>
    );
  }

  const isAvailable = donation.status === 'available';
  const statusCfg = StatusConfig[donation.status] || StatusConfig.available;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Photo header */}
        <View style={styles.photoContainer}>
          {donation.photo ? (
            <Image source={{ uri: donation.photo }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoEmoji}>🍽️</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Status badge overlay */}
          <View style={styles.statusOverlay}>
            <StatusBadge status={donation.status} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title + donor */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{donation.name}</Text>
          </View>

          <Text style={styles.donorName}>
            🏪 {donation.donorId?.orgName || donation.donorId?.name || 'Anonymous Donor'}
          </Text>

          {/* Expiry countdown */}
          <ExpiryCountdown expiryTime={donation.expiryTime} />

          {/* Key stats */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="restaurant-outline"
              label="Quantity"
              value={`${donation.quantity?.amount} ${donation.quantity?.unit}`}
            />
            <StatCard
              icon="layers-outline"
              label="Food Type"
              value={donation.type?.replace('_', ' ')}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this food</Text>
            <Text style={styles.description}>{donation.description}</Text>
          </View>

          {/* Dietary info */}
          {donation.dietaryInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dietary Information</Text>
              <View style={styles.tagsRow}>
                {donation.dietaryInfo.vegetarian && <DietTag label="🌿 Vegetarian" />}
                {donation.dietaryInfo.vegan && <DietTag label="🌱 Vegan" />}
                {donation.dietaryInfo.glutenFree && <DietTag label="🚫 Gluten Free" />}
                {donation.dietaryInfo.nutFree && <DietTag label="🚫 Nut Free" />}
                {donation.dietaryInfo.dairyFree && <DietTag label="🚫 Dairy Free" />}
              </View>
            </View>
          )}

          {/* Pickup instructions */}
          {donation.pickupInstructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Instructions</Text>
              <View style={styles.instructionsBox}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
                <Text style={styles.instructions}>{donation.pickupInstructions}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.locationRow} onPress={openDirections}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.locationText} numberOfLines={2}>
                {donation.location?.address || 'Address not available'}
              </Text>
              <Ionicons name="open-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Claim button */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {isAvailable ? (
          <TouchableOpacity
            style={[styles.claimBtn, claiming && styles.btnDisabled]}
            onPress={handleClaim}
            disabled={claiming}
            activeOpacity={0.85}
          >
            {claiming ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
                <Text style={styles.claimBtnText}>Claim This Donation</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.claimBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>
              {donation.status === 'claimed' ? 'Already Claimed' : `Status: ${donation.status}`}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DietTag({ label }: { label: string }) {
  return (
    <View style={styles.dietTag}>
      <Text style={styles.dietTagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textSecondary, fontSize: FontSize.lg },
  photoContainer: { height: 260, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
  },
  content: { padding: Spacing.xl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, flex: 1 },
  donorName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dietTag: {
    backgroundColor: `${Colors.secondary}20`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: `${Colors.secondary}40`,
  },
  dietTagText: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '600' },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.info}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.info}30`,
  },
  instructions: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.xl,
  },
  claimBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.md,
  },
  btnDisabled: { opacity: 0.6 },
  claimBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  disabledBtn: { backgroundColor: Colors.surfaceElevated },
  disabledBtnText: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: '600' },
});
