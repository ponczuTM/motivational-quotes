// App.js

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { scheduleDailyMotivationNotification } from './src/utils/notifications';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AccountScreen from './src/screens/AccountScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';

// Utwórz te dwa ekrany, jeśli jeszcze ich nie masz.
import HelpScreen from './src/screens/HelpScreen';
import PlanScreen from './src/screens/PlanScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#FCF4EC',
  surface: '#FFFDFB',
  coral: '#FF7A45',
  text: '#20252D',
  inactive: '#8C8581',
  border: '#F1E5DD',
};

function TabBarIcon({ routeName, focused, color, size }) {
  const iconMap = {
    Start: focused ? 'home-variant' : 'home-variant-outline',
    Pomoc: focused ? 'hand-heart' : 'hand-heart-outline',
    'Mój plan': focused ? 'clipboard-text' : 'clipboard-text-outline',
    Profil: focused ? 'account' : 'account-outline',
    Subskrypcja: focused ? 'diamond-stone' : 'diamond-outline',
  };

  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
      <MaterialCommunityIcons
        name={iconMap[routeName]}
        size={size}
        color={color}
      />
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Start"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: COLORS.coral,
        tabBarInactiveTintColor: COLORS.inactive,

        tabBarLabelStyle: styles.tabLabel,

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: styles.tabBarItem,

        tabBarHideOnKeyboard: true,

        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Start"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Start',
        }}
      />

      <Tab.Screen
        name="Pomoc"
        component={HelpScreen}
        options={{
          tabBarLabel: 'Pomoc',
        }}
      />

      <Tab.Screen
        name="Mój plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'Mój plan',
        }}
      />

      <Tab.Screen
        name="Profil"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />

      <Tab.Screen
        name="Subskrypcja"
        component={SubscriptionScreen}
        options={{
          tabBarLabel: 'Premium',
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="dark" backgroundColor={COLORS.background} />

        <View style={styles.loadingIconCircle}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={35}
            color={COLORS.coral}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.coral}
          style={styles.loadingIndicator}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={COLORS.background} />

      {user ? <AppTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    scheduleDailyMotivationNotification();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  loadingIconCircle: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
    backgroundColor: '#FFE5D8',
  },

  loadingIndicator: {
    marginTop: 22,
  },

  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 70,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 9,
    elevation: 14,
    shadowColor: '#68534A',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 13,
  },

  tabBarItem: {
    paddingTop: 1,
  },

  tabIconContainer: {
    width: 38,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },

  tabIconActive: {
    backgroundColor: '#FFF0E8',
  },

  tabLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
  },
});