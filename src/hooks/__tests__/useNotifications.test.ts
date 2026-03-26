import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

jest.mock('../../utils/notifications', () => ({
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
  scheduleAllNotifications: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  NOTIFICATIONS_KEY: 'notifications_enabled',
}));

jest.mock('../../db/bills', () => ({
  getActiveBills: jest.fn().mockResolvedValue([]),
}));

const mockGetItem = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItem = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;

import { useNotifications } from '../useNotifications';
import * as notificationsUtil from '../../utils/notifications';

const mockRequestPerms = notificationsUtil.requestNotificationPermissions as jest.MockedFunction<typeof notificationsUtil.requestNotificationPermissions>;
const mockSchedule = notificationsUtil.scheduleAllNotifications as jest.MockedFunction<typeof notificationsUtil.scheduleAllNotifications>;
const mockCancel = notificationsUtil.cancelAllNotifications as jest.MockedFunction<typeof notificationsUtil.cancelAllNotifications>;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
});

describe('useNotifications', () => {
  it('reports supported on device', async () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.isSupported).toBe(true);
  });

  it('loads enabled state from SecureStore', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
    });
  });

  it('defaults to disabled when no stored value', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith('notifications_enabled');
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it('enable requests permissions and schedules notifications', async () => {
    mockRequestPerms.mockResolvedValue(true);

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.enable();
    });

    expect(mockRequestPerms).toHaveBeenCalled();
    expect(mockSetItem).toHaveBeenCalledWith('notifications_enabled', 'true');
    expect(mockSchedule).toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(true);
  });

  it('enable shows alert when permissions denied', async () => {
    mockRequestPerms.mockResolvedValue(false);
    jest.spyOn(Alert, 'alert');

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      const success = await result.current.enable();
      expect(success).toBe(false);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permissions Required',
      expect.any(String)
    );
    expect(result.current.isEnabled).toBe(false);
  });

  it('disable cancels all notifications', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
    });

    await act(async () => {
      await result.current.disable();
    });

    expect(mockSetItem).toHaveBeenCalledWith('notifications_enabled', 'false');
    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(false);
  });
});
