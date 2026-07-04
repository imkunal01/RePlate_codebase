import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <View style={styles.gradientBg} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <SafeAreaView style={styles.content}>
        {/* Logo + Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🍽️</Text>
          </View>
          <Text style={styles.brandName}>RePlate</Text>
          <Text style={styles.tagline}>Every Meal Deserves a Plate.</Text>
        </View>

        {/* Impact stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Meals Rescued</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>200+</Text>
            <Text style={styles.statLabel}>Active Donors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>80+</Text>
            <Text style={styles.statLabel}>NGOs Served</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Who are you?</Text>

          {/* Donor button */}
          <TouchableOpacity
            style={styles.donorButton}
            onPress={() => navigation.navigate('Login', { role: 'donor' })}
            activeOpacity={0.85}
          >
            <View style={styles.buttonIconBg}>
              <Ionicons name="restaurant" size={22} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>I have food to donate</Text>
              <Text style={styles.buttonSubtitle}>Restaurant, hotel, event organizer…</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* NGO/Recipient button */}
          <TouchableOpacity
            style={styles.ngoButton}
            onPress={() => navigation.navigate('Login', { role: 'recipient' })}
            activeOpacity={0.85}
          >
            <View style={[styles.buttonIconBg, styles.ngoIconBg]}>
              <Ionicons name="people" size={22} color={Colors.secondary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, styles.ngoTitle]}>I need food for my community</Text>
              <Text style={styles.buttonSubtitle}>NGO, shelter, food bank…</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mission tagline */}
        <Text style={styles.missionText}>
          Food should never be wasted while people remain hungry.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.07,
  },
  circleTopRight: {
    width: 300,
    height: 300,
    backgroundColor: Colors.primary,
    top: -80,
    right: -80,
  },
  circleBottomLeft: {
    width: 250,
    height: 250,
    backgroundColor: Colors.secondary,
    bottom: -60,
    left: -80,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  brandName: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  ctaSection: {
    gap: Spacing.md,
  },
  ctaTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  donorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  ngoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.secondary}40`,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  buttonIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ngoIconBg: {
    backgroundColor: `${Colors.secondary}20`,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  ngoTitle: {
    color: Colors.text,
  },
  buttonSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  signupText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  missionText: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: Spacing.md,
  },
});
