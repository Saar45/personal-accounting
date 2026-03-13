import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const mockHasHardware = LocalAuthentication.hasHardwareAsync as jest.MockedFunction<typeof LocalAuthentication.hasHardwareAsync>;
const mockIsEnrolled = LocalAuthentication.isEnrolledAsync as jest.MockedFunction<typeof LocalAuthentication.isEnrolledAsync>;
const mockGetItem = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItem = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;

import { useBiometricLock } from '../useBiometricLock';

beforeEach(() => {
  jest.clearAllMocks();
  mockHasHardware.mockResolvedValue(true);
  mockIsEnrolled.mockResolvedValue(true);
  mockGetItem.mockResolvedValue(null);
});

describe('useBiometricLock', () => {
  it('reports supported when hardware and enrollment exist', async () => {
    const { result } = renderHook(() => useBiometricLock());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });
  });

  it('reports not supported when no hardware', async () => {
    mockHasHardware.mockResolvedValue(false);

    const { result } = renderHook(() => useBiometricLock());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });
  });

  it('loads enabled state and locks when enabled', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useBiometricLock());

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isLocked).toBe(true);
    });
  });

  it('enable persists to SecureStore', async () => {
    const { result } = renderHook(() => useBiometricLock());

    await act(async () => {
      await result.current.enable();
    });

    expect(mockSetItem).toHaveBeenCalledWith('biometric_lock_enabled', 'true');
    expect(result.current.isEnabled).toBe(true);
  });

  it('disable clears lock and persists', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useBiometricLock());

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
    });

    await act(async () => {
      await result.current.disable();
    });

    expect(mockSetItem).toHaveBeenCalledWith('biometric_lock_enabled', 'false');
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isLocked).toBe(false);
  });

  it('unlock sets isLocked to false', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useBiometricLock());

    await waitFor(() => {
      expect(result.current.isLocked).toBe(true);
    });

    act(() => {
      result.current.unlock();
    });

    expect(result.current.isLocked).toBe(false);
  });
});
