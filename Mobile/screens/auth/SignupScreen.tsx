import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const ORG_TYPES = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'hotel', label: '🏨 Hotel' },
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'hostel', label: '🏠 Hostel / Mess' },
  { value: 'caterer', label: '🍱 Caterer' },
  { value: 'event_organizer', label: '🎉 Event Organizer' },
  { value: 'ngo', label: '🤝 NGO' },
  { value: 'community_kitchen', label: '🥘 Community Kitchen' },
  { value: 'orphanage', label: '👶 Orphanage' },
  { value: 'old_age_home', label: '👴 Old Age Home' },
  { value: 'food_bank', label: '🏦 Food Bank' },
  { value: 'household', label: '🏡 Household' },
  { value: 'other', label: '📦 Other' },
];

export default function SignupScreen({ navigation, route }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOrgTypes, setShowOrgTypes] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const { coordinates, address, getCurrentLocation } = useLocationStore();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in Name, Email, and Password' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (!coordinates) {
      Toast.show({ type: 'info', text1: 'Location needed', text2: 'Please add your location' });
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        orgName: orgName.trim(),
        orgType: orgType || 'other',
        location: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
          address,
        },
        role: route.params?.role,
      });
      setUser(user, user.token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      Toast.show({ type: 'error', text1: 'Sign Up Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const selectedOrgLabel =
    ORG_TYPES.find((t) => t.value === orgType)?.label || 'Select organization type';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kbView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join RePlate 🌱</Text>
            <Text style={styles.subtitle}>Start rescuing food in your community</Text>
          </View>

          {/* Required fields */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Basic Information</Text>

            <InputField
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <InputField
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min 6 chars)"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional org info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Organization (Optional)</Text>

            <InputField
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
            <InputField
              icon="business-outline"
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Organization name"
            />

            {/* Org type picker */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowOrgTypes((v) => !v)}
            >
              <Ionicons name="layers-outline" size={18} color={Colors.textMuted} />
              <Text
                style={[
                  styles.input,
                  { color: orgType ? Colors.text : Colors.textMuted, paddingVertical: 0 },
                ]}
              >
                {selectedOrgLabel}
              </Text>
              <Ionicons
                name={showOrgTypes ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showOrgTypes && (
              <View style={styles.dropdown}>
                {ORG_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.dropdownItem, orgType === type.value && styles.dropdownItemActive]}
                    onPress={() => {
                      setOrgType(type.value);
                      setShowOrgTypes(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownLabel,
                        orgType === type.value && styles.dropdownLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Location</Text>
            <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
              <Ionicons
                name={coordinates ? 'location' : 'location-outline'}
                size={20}
                color={coordinates ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[styles.locationText, coordinates && styles.locationTextActive]}
                numberOfLines={1}
              >
                {coordinates ? address || 'Location obtained ✓' : 'Tap to use current location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign up button */}
          <TouchableOpacity
            style={[styles.signupBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable input field component
function InputField({ icon, ...props }: any) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={18} color={Colors.textMuted} />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  kbView: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl * 2 },
  backBtn: {
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { marginTop: Spacing.xxl, marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { gap: Spacing.sm, marginBottom: Spacing.xl },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 2 },
  dropdown: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: `${Colors.primary}15` },
  dropdownLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  dropdownLabelActive: { color: Colors.primary, fontWeight: '600' },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  locationText: { flex: 1, fontSize: FontSize.md, color: Colors.textMuted },
  locationTextActive: { color: Colors.text },
  signupBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadow.primary,
  },
  btnDisabled: { opacity: 0.6 },
  signupBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  loginText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  loginLink: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
