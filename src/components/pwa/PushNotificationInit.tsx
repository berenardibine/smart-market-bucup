import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Component that initializes push notifications.
 * Auto-subscribes users when notification permission is granted.
 */
const PushNotificationInit = () => {
  // This hook auto-subscribes when user is logged in and notifications are granted
  usePushNotifications();
  return null;
};

export default PushNotificationInit;
