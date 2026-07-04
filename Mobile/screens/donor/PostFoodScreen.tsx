import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { foodService } from '../../services/foodService';
import { useLocationStore } from '../../store/locationStore';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const FOOD_TYPES = [
  { value: 'cooked', label: '🍛 Cooked Food' },
  { value: 'packaged', label: '📦 Packaged' },
  { value: 'fresh', label: '🥦 Fresh Produce' },
  { value: 'bakery', label: '🥖 Bakery' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'canned', label: '🥫 Canned' },
  { value: 'other', label: '📋 Other' },
];

const QUANTITY_UNITS = ['servings', 'kg', 'items', 'packages', 'lbs'];

export default function PostFoodScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { coordinates, address, getCurrentLocation } = useLocationStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState('cooked');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('servings');
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours from now
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dietary info
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);

      // Upload to Cloudinary
      setUploadingPhoto(true);
      try {
        const url = await foodService.uploadPhoto(uri);
        setPhotoUrl(url);
        Toast.show({ type: 'success', text1: 'Photo uploaded ✓' });
      } catch {
        Toast.show({ type: 'error', text1: 'Photo upload failed' });
        setPhoto(null);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handlePost = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter the food name' });
      return;
    }
    if (!description.trim()) {
      Toast.show({ type: 'error', text1: 'Please add a description' });
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Toast.show({ type: 'error', text1: 'Please enter a valid quantity' });
      return;
    }
    if (!coordinates) {
      Toast.show({ type: 'error', text1: 'Location required', text2: 'Tap to add your location' });
      return;
    }
    if (uploadingPhoto) {
      Toast.show({ type: 'info', text1: 'Please wait — photo is uploading' });
      return;
    }

    setLoading(true);
    try {
      await foodService.create({
        name: name.trim(),
        description: description.trim(),
        type: foodType as any,
        quantity: { amount: Number(quantity), unit },
        expiryTime: expiryDate.toISOString(),
        location: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
          address,
        },
        pickupInstructions: pickupInstructions.trim(),
        dietaryInfo: { vegetarian, vegan, glutenFree },
        photo: photoUrl || '',
      });

      queryClient.invalidateQueries({ queryKey: ['myDonations'] });
      Toast.show({ type: 'success', text1: '🍽️ Donation posted!', text2: 'Nearby NGOs are being notified' });

      // Reset form
      setName('');
      setDescription('');
      setQuantity('');
      setPhoto(null);
      setPhotoUrl(null);
      setPickupInstructions('');

      // Navigate to home
      navigation.navigate('DonorHome');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to post donation';
      Toast.show({ type: 'error', text1: 'Post Failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Donate Food 🍽️</Text>
            <Text style={styles.subtitle}>Fill in the details — takes under a minute</Text>
          </View>

          {/* Photo */}
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage} activeOpacity={0.8}>
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                {uploadingPhoto && (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color={Colors.white} />
                    <Text style={styles.photoOverlayText}>Uploading…</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.photoPlaceholderText}>Add Photo (Optional)</Text>
                <Text style={styles.photoPlaceholderSub}>Tap to take or choose a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Food name */}
          <View style={styles.field}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rice and Dal, Wedding Buffet Leftovers"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the food, how it was prepared, any allergens..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Food type */}
          <View style={styles.field}>
            <Text style={styles.label}>Food Type *</Text>
            <View style={styles.chipRow}>
              {FOOD_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.chip, foodType === type.value && styles.chipActive]}
                  onPress={() => setFoodType(type.value)}
                >
                  <Text style={[styles.chipText, foodType === type.value && styles.chipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.field}>
            <Text style={styles.label}>Quantity *</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <View style={styles.unitRow}>
                {QUANTITY_UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Expiry */}
          <View style={styles.field}>
            <Text style={styles.label}>Available Until *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
                <Text style={{ color: Colors.text, fontSize: FontSize.md }}>
                  {expiryDate.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="datetime"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setExpiryDate(date);
                }}
              />
            )}
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Pickup Location *</Text>
            <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
              <Ionicons
                name={coordinates ? 'location' : 'location-outline'}
                size={20}
                color={coordinates ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.locationText, coordinates && { color: Colors.text }]} numberOfLines={1}>
                {coordinates ? address || 'Location set ✓' : 'Use current location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dietary info */}
          <View style={styles.field}>
            <Text style={styles.label}>Dietary Info</Text>
            {[
              { label: 'Vegetarian', value: vegetarian, setter: setVegetarian },
              { label: 'Vegan', value: vegan, setter: setVegan },
              { label: 'Gluten Free', value: glutenFree, setter: setGlutenFree },
            ].map(({ label, value, setter }) => (
              <View key={label} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{label}</Text>
                <Switch
                  value={value}
                  onValueChange={setter}
                  trackColor={{ false: Colors.border, true: `${Colors.primary}80` }}
                  thumbColor={value ? Colors.primary : Colors.textMuted}
                />
              </View>
            ))}
          </View>

          {/* Pickup instructions */}
          <View style={styles.field}>
            <Text style={styles.label}>Pickup Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={pickupInstructions}
              onChangeText={setPickupInstructions}
              placeholder="e.g. Enter from back gate, ask for Ramesh, available until 8pm"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handlePost}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={Colors.white} />
                <Text style={styles.submitBtnText}>Post Donation</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Nearby verified NGOs will be notified immediately after posting.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.section },
  header: { paddingTop: Spacing.lg, marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  photoContainer: {
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoOverlayText: { color: Colors.white, fontWeight: '600' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoPlaceholderText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  photoPlaceholderSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  field: { marginBottom: Spacing.xl },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  quantityRow: { gap: Spacing.sm },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  unitChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: { backgroundColor: `${Colors.primary}20`, borderColor: Colors.primary },
  unitText: { fontSize: FontSize.xs, color: Colors.textMuted },
  unitTextActive: { color: Colors.primary, fontWeight: '600' },
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchLabel: { fontSize: FontSize.md, color: Colors.text },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadow.primary,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
});
