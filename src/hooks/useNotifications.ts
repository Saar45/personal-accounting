import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { getActiveBills } from '../db/bills';
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
  NOTIFICATIONS_KEY,
} from '../utils/notifications';

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported] = useState(Device.isDevice);

  useEffect(() => {
    async function loadSetting() {
      const stored = await SecureStore.getItemAsync(NOTIFICATIONS_KEY);
      setIsEnabled(stored === 'true');
    }
    loadSetting();
  }, []);

  const enable = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to receive bill reminders.'
      );
      return false;
    }
    await SecureStore.setItemAsync(NOTIFICATIONS_KEY, 'true');
    setIsEnabled(true);
    const bills = await getActiveBills();
    await scheduleAllNotifications(bills);
    return true;
  }, []);

  const disable = useCallback(async () => {
    await SecureStore.setItemAsync(NOTIFICATIONS_KEY, 'false');
    setIsEnabled(false);
    await cancelAllNotifications();
  }, []);

  return { isEnabled, isSupported, enable, disable };
}
