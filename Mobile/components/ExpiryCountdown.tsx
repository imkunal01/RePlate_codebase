import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface ExpiryCountdownProps {
  expiryTime: string;
  compact?: boolean;
}

export default function ExpiryCountdown({ expiryTime, compact = false }: ExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const expiry = new Date(expiryTime).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const urgent = diff < 2 * 60 * 60 * 1000; // < 2 hours
      setIsUrgent(urgent);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s left`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  // Pulse animation when urgent
  useEffect(() => {
    if (isUrgent && !isExpired) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isUrgent, isExpired]);

  if (compact) {
    return (
      <Text style={[styles.compactText, isUrgent && styles.urgentText, isExpired && styles.expiredText]}>
        {isExpired ? '⛔ Expired' : isUrgent ? `⚡ ${timeLeft}` : `⏱ ${timeLeft}`}
      </Text>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isUrgent && styles.urgentContainer,
        isExpired && styles.expiredContainer,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Ionicons
        name={isExpired ? 'close-circle' : isUrgent ? 'flash' : 'time-outline'}
        size={18}
        color={isExpired ? Colors.error : isUrgent ? Colors.warning : Colors.textSecondary}
      />
      <Text
        style={[
          styles.timeText,
          isUrgent && styles.urgentTimeText,
          isExpired && styles.expiredTimeText,
        ]}
      >
        {timeLeft}
      </Text>
      {isUrgent && !isExpired && (
        <Text style={styles.urgentLabel}>ACT FAST</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 6,
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  urgentContainer: {
    backgroundColor: `${Colors.warning}15`,
    borderColor: `${Colors.warning}50`,
  },
  expiredContainer: {
    backgroundColor: `${Colors.error}15`,
    borderColor: `${Colors.error}50`,
  },
  timeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  urgentTimeText: {
    color: Colors.warning,
  },
  expiredTimeText: {
    color: Colors.error,
  },
  urgentLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.warning,
    backgroundColor: `${Colors.warning}30`,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  compactText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  urgentText: { color: Colors.warning },
  expiredText: { color: Colors.error },
});
