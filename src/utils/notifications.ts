import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { parseISO, subDays, isBefore, startOfDay } from 'date-fns';
import { formatEUR } from './currency';
import { getActiveBills } from '../db/bills';
import { BillWithCategory } from '../db/types';

export const NOTIFICATIONS_KEY = 'notifications_enabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAllNotifications(bills: BillWithCategory[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const today = startOfDay(now);

  // Bill notifications — due within 7 days
  for (const bill of bills) {
    if (!bill.is_active || !bill.next_due_date) continue;

    const dueDate = startOfDay(parseISO(bill.next_due_date));
    const eveDate = subDays(dueDate, 1);

    // Day-before notification at 9am
    if (!isBefore(eveDate, today)) {
      const eveTrigger = new Date(eveDate);
      eveTrigger.setHours(9, 0, 0, 0);
      if (eveTrigger > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `bill-${bill.id}-eve`,
          content: {
            title: bill.name,
            body: `Due tomorrow — ${formatEUR(bill.amount)}`,
            sound: true,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: eveTrigger },
        });
      }
    }

    // Due-day notification at 9am
    if (!isBefore(dueDate, today)) {
      const dueTrigger = new Date(dueDate);
      dueTrigger.setHours(9, 0, 0, 0);
      if (dueTrigger > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `bill-${bill.id}-due`,
          content: {
            title: bill.name,
            body: `Due today — ${formatEUR(bill.amount)}`,
            sound: true,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueTrigger },
        });
      }
    }
  }

  // Monthly salary reminder — 1st of every month at 9am
  await Notifications.scheduleNotificationAsync({
    identifier: 'monthly-salary-reminder',
    content: {
      title: 'Monthly Review',
      body: "Time to add your salary and review last month's expenses",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: 1,
      hour: 9,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleNotificationsIfEnabled(): Promise<void> {
  const stored = await SecureStore.getItemAsync(NOTIFICATIONS_KEY);
  if (stored !== 'true') return;

  const bills = await getActiveBills();
  await scheduleAllNotifications(bills);
}
