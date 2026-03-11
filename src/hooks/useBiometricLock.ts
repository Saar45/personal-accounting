import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_KEY = 'biometric_lock_enabled';

export function useBiometricLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check hardware support and enrollment
  useEffect(() => {
    async function checkSupport() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsSupported(hasHardware && isEnrolled);
    }
    checkSupport();
  }, []);

  // Load persisted setting
  useEffect(() => {
    async function loadSetting() {
      const stored = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      const enabled = stored === 'true';
      setIsEnabled(enabled);
      if (enabled) {
        setIsLocked(true);
      }
    }
    loadSetting();
  }, []);

  // Listen for app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isEnabled
      ) {
        setIsLocked(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isEnabled]);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const enable = useCallback(async () => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
    setIsEnabled(true);
  }, []);

  const disable = useCallback(async () => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, 'false');
    setIsEnabled(false);
    setIsLocked(false);
  }, []);

  return { isLocked, isEnabled, unlock, enable, disable, isSupported };
}
