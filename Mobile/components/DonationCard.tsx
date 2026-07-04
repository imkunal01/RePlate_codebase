import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../constants/theme';
import StatusBadge from './StatusBadge';
import ExpiryCountdown from './ExpiryCountdown';

interface DonationCardProps {
  donation: any;
  onPress: () => void;
  showStatusActions?: boolean;
  onStatusUpdate?: (status: string) => void;
}

export default function DonationCard({
  donation,
  onPress,
  showStatusActions = false,
  onStatusUpdate,
}: DonationCardProps) {
  const donorName =
    donation.donorId?.orgName || donation.donorId?.name || 'Anonymous Donor';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        {donation.photo ? (
          <Image source={{ uri: donation.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoEmoji}>🍽️</Text>
          </View>
        )}
        {/* Food type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{donation.type}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: name + status */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {donation.name}
          </Text>
          <StatusBadge status={donation.status} size="sm" />
        </View>

        {/* Donor */}
        <Text style={styles.donorName} numberOfLines={1}>
          🏪 {donorName}
        </Text>

        {/* Quantity + expiry row */}
        <View style={styles.metaRow}>
          <View style={styles.quantityChip}>
            <Ionicons name="restaurant-outline" size={12} color={Colors.primary} />
            <Text style={styles.quantityText}>
              {donation.quantity?.amount} {donation.quantity?.unit}
            </Text>
          </View>
          <ExpiryCountdown expiryTime={donation.expiryTime} compact />
        </View>

        {/* Location */}
        {donation.location?.address && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {donation.location.address}
            </Text>
          </View>
        )}

        {/* Status action buttons (for donor view) */}
        {showStatusActions && onStatusUpdate && (
          <View style={styles.actionsRow}>
            {donation.status === 'claimed' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.collectBtn]}
                onPress={() => onStatusUpdate('collected')}
              >
                <Text style={styles.actionBtnText}>Mark Collected</Text>
              </TouchableOpacity>
            )}
            {donation.status === 'collected' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => onStatusUpdate('completed')}
              >
                <Text style={styles.actionBtnText}>Mark Complete ✓</Text>
              </TouchableOpacity>
            )}
            {donation.status === 'available' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.expireBtn]}
                onPress={() => onStatusUpdate('expired')}
              >
                <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                  Cancel Donation
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  photoContainer: {
    height: 140,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 40 },
  typeBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.overlay,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  donorName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  quantityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  quantityText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    flex: 1,
  },
  actionsRow: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  collectBtn: {
    backgroundColor: `${Colors.statusCollected}15`,
    borderColor: `${Colors.statusCollected}40`,
  },
  completeBtn: {
    backgroundColor: `${Colors.secondary}15`,
    borderColor: `${Colors.secondary}40`,
  },
  expireBtn: {
    backgroundColor: `${Colors.error}10`,
    borderColor: `${Colors.error}30`,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
