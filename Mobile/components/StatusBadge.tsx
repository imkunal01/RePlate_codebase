import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius, StatusConfig } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = StatusConfig[status] || StatusConfig.available;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: `${config.color}20`, borderColor: `${config.color}50` },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          { color: config.color },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSm: {
    fontSize: 9,
  },
});
