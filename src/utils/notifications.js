// src/utils/notifications.js

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { CONTENT_CUTOFF_HOUR, CONTENT_CUTOFF_MINUTE } from './dateLogic';

const ANDROID_CHANNEL_ID = 'daily-motivation';
const DAILY_NOTIFICATION_IDENTIFIER = 'daily-motivation-1111';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Codzienna motywacja',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF7A45',
  });
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();

  if (current.status === 'granted') {
    return true;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requested.status === 'granted';
}

// Planuje cykliczne powiadomienie codziennie o 11:11. Bezpieczne do
// wywoływania wielokrotnie - nie duplikuje wpisu w harmonogramie.
export async function scheduleDailyMotivationNotification() {
  if (Platform.OS === 'web') {
    return false;
  }

  await ensureAndroidChannel();

  const granted = await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const alreadyScheduled = scheduled.some(
    (notification) => notification.identifier === DAILY_NOTIFICATION_IDENTIFIER
  );

  if (alreadyScheduled) {
    return true;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NOTIFICATION_IDENTIFIER,
    content: {
      title: 'Nowa dawka motywacji już tu jest! 🌅',
      body: 'Sprawdź dzisiejszy cytat i mały krok, który możesz dziś wykonać.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: CONTENT_CUTOFF_HOUR,
      minute: CONTENT_CUTOFF_MINUTE,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  return true;
}

export async function cancelDailyMotivationNotification() {
  await Notifications.cancelScheduledNotificationAsync(
    DAILY_NOTIFICATION_IDENTIFIER
  );
}
