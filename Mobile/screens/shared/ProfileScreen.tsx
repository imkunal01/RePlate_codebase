import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout, switchRole } = useAuthStore();

  const handleSwitchRole = async () => {
    try {
      await switchRole();
      Toast.show({
        type: 'success',
        text1: `Switched to ${user?.activeRole === 'donor' ? 'recipient' : 'donor'} mode`,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to switch role' });
    }
  };

  const handleLogout = async () => {
    // Executing directly to ensure it works reliably across all environments
    await logout();
    Toast.show({ type: 'success', text1: 'Logged out successfully' });
  };

  const showComingSoon = () => {
    Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'This feature is under development' });
  };

  const isDonor = user?.activeRole === 'donor';
  const isVerified = user?.isVerified;
  const verificationStatus = user?.verificationStatus;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user?.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}

            {/* Role badge */}
            <View style={[styles.roleBadge, isDonor ? styles.roleBadgeDonor : styles.roleBadgeRecipient]}>
              <Ionicons
                name={isDonor ? 'restaurant' : 'people'}
                size={12}
                color={Colors.white}
              />
            </View>
          </View>

          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.orgName && (
            <Text style={styles.orgName}>{user.orgName}</Text>
          )}

          {/* Verification status */}
          {!isDonor && (
            <View style={[
              styles.verificationBadge,
              isVerified ? styles.verifiedBadge : styles.unverifiedBadge
            ]}>
              <Ionicons
                name={isVerified ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={isVerified ? Colors.secondary : Colors.warning}
              />
              <Text style={[styles.verificationText, isVerified ? styles.verifiedText : styles.unverifiedText]}>
                {isVerified ? 'Verified NGO' : verificationStatus === 'pending' ? 'Verification Pending' : 'Not Verified'}
              </Text>
            </View>
          )}
        </View>

        {/* Current mode */}
        <View style={styles.modeCard}>
          <View style={styles.modeInfo}>
            <Text style={styles.modeLabel}>Current Mode</Text>
            <Text style={styles.modeValue}>{isDonor ? '🍽️ Donor' : '🤝 Recipient'}</Text>
          </View>
          <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchRole}>
            <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
            <Text style={styles.switchBtnText}>Switch</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          <MenuSection title="Account">
            <MenuItem icon="person-outline" label="Edit Profile" onPress={showComingSoon} />
            <MenuItem icon="location-outline" label="Update Location" onPress={showComingSoon} />
            {!isDonor && !isVerified && verificationStatus !== 'pending' && (
              <MenuItem
                icon="shield-checkmark-outline"
                label="Apply for NGO Verification"
                onPress={showComingSoon}
                accent
              />
            )}
          </MenuSection>

          <MenuSection title="Support">
            <MenuItem icon="help-circle-outline" label="Help & FAQ" onPress={showComingSoon} />
            <MenuItem icon="chatbubble-outline" label="Contact Us" onPress={showComingSoon} />
            <MenuItem icon="document-text-outline" label="Terms of Service" onPress={showComingSoon} />
          </MenuSection>

          <MenuSection title="Danger Zone">
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              destructive
            />
          </MenuSection>
        </View>

        <Text style={styles.version}>RePlate v1.0.0 · Every Meal Deserves a Plate.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={menuStyles.section}>
      <Text style={menuStyles.sectionTitle}>{title}</Text>
      <View style={menuStyles.items}>{children}</View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
  accent,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  accent?: boolean;
}) {
  const color = destructive ? Colors.error : accent ? Colors.primary : Colors.text;
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[menuStyles.itemLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxxl },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  roleBadgeDonor: { backgroundColor: Colors.primary },
  roleBadgeRecipient: { backgroundColor: Colors.secondary },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  orgName: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.md,
    gap: 6,
  },
  verifiedBadge: { backgroundColor: `${Colors.secondary}20` },
  unverifiedBadge: { backgroundColor: `${Colors.warning}20` },
  verificationText: { fontSize: FontSize.xs, fontWeight: '600' },
  verifiedText: { color: Colors.secondary },
  unverifiedText: { color: Colors.warning },
  modeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  modeInfo: {},
  modeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  modeValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: 2 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  switchBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
  menu: { paddingHorizontal: Spacing.xl, gap: Spacing.xl },
  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.xxxl,
    fontStyle: 'italic',
  },
});

const menuStyles = StyleSheet.create({
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  items: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  itemLabel: { flex: 1, fontSize: FontSize.md },
});
