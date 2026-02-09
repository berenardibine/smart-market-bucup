import { useEffect, useCallback } from 'react';
import { useGeo } from '@/context/GeoContext';

const PERMISSIONS_KEY = 'sm-permissions';
const NOTIF_REPROMPT_KEY = 'sm-notif-reprompt';
const REPROMPT_DELAY = 24 * 60 * 60 * 1000; // 24 hours

interface StoredPermissions {
  location: PermissionState | null;
  notifications: NotificationPermission | null;
  timestamp: number;
}

const PermissionHandler = () => {
  const { requestLocationPermission } = useGeo();

  const getStoredPermissions = (): StoredPermissions | null => {
    try {
      const stored = localStorage.getItem(PERMISSIONS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const storePermissions = (perms: Partial<StoredPermissions>) => {
    const existing = getStoredPermissions();
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify({
      ...existing,
      ...perms,
      timestamp: Date.now(),
    }));
  };

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;

    const current = Notification.permission;
    if (current === 'granted') {
      storePermissions({ notifications: 'granted' });
      return;
    }

    if (current === 'denied') {
      storePermissions({ notifications: 'denied' });
      return;
    }

    // Only prompt if not recently denied
    const lastReprompt = localStorage.getItem(NOTIF_REPROMPT_KEY);
    if (lastReprompt) {
      const elapsed = Date.now() - parseInt(lastReprompt);
      if (elapsed < REPROMPT_DELAY) return;
    }

    try {
      const result = await Notification.requestPermission();
      storePermissions({ notifications: result });
      if (result === 'denied' || result === 'default') {
        localStorage.setItem(NOTIF_REPROMPT_KEY, Date.now().toString());
      }
    } catch (err) {
      console.error('[PermissionHandler] Notification request failed:', err);
    }
  }, []);

  const requestLocationPermissionWrapped = useCallback(async () => {
    try {
      await requestLocationPermission();
      storePermissions({ location: 'granted' });
    } catch {
      storePermissions({ location: 'denied' });
    }
  }, [requestLocationPermission]);

  useEffect(() => {
    // Delay permission requests to avoid overwhelming users on first load
    const timer = setTimeout(() => {
      const stored = getStoredPermissions();

      // Request location if not already granted
      if (!stored?.location || stored.location !== 'granted') {
        requestLocationPermissionWrapped();
      }

      // Request notifications slightly later
      setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [requestLocationPermissionWrapped, requestNotificationPermission]);

  // Re-check denied notification permission after 24h
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    const interval = setInterval(() => {
      requestNotificationPermission();
    }, REPROMPT_DELAY);

    return () => clearInterval(interval);
  }, [requestNotificationPermission]);

  return null; // This is a side-effect-only component
};

export default PermissionHandler;
