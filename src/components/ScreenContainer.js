// src/components/ScreenContainer.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenContainer({ children, style }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 14,
          paddingBottom: tabBarHeight + insets.bottom + 28,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF4EC',
  },
});