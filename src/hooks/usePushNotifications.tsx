import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BH0zQAYeJGyqymXCisO53dcWBoDDpF9hykI4MzsP-OrKyquldTsCKN1iup1gQODxaRNa-d5qSoNrWUfG981ZDssO';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        setIsSubscribed(true);
        // Re-sync subscription to DB in case it was lost
        await storeSubscription(existingSub);
      }
    } catch (err) {
      console.error('[Push] Error checking subscription:', err);
    }
  };

  const storeSubscription = async (sub: PushSubscription) => {
    try {
      const subJson = sub.toJSON();
      const p256dh = subJson.keys?.p256dh || '';
      const auth = subJson.keys?.auth || '';
      
      if (!p256dh || !auth) {
        console.error('[Push] Missing encryption keys from subscription');
        return;
      }

      // Store in push_subscriptions table
      const { error: pushError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user?.id || null,
          endpoint: sub.endpoint,
          p256dh,
          auth,
        }, { onConflict: 'endpoint' });
      
      if (pushError) {
        console.error('[Push] Failed to store push subscription:', pushError);
      } else {
        console.log('[Push] Subscription stored successfully');
      }

      // Also store in notification_tokens for compatibility
      if (user) {
        await supabase
          .from('notification_tokens' as any)
          .upsert({
            user_id: user.id,
            token: sub.endpoint,
            device_info: {
              type: 'web-push',
              user_agent: navigator.userAgent,
              platform: navigator.platform,
              registered_at: new Date().toISOString(),
            },
          }, { onConflict: 'token' });
      }
    } catch (err) {
      console.error('[Push] Error storing subscription:', err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[Push] Permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe old subscription first to avoid conflicts
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Store subscription in database
      await storeSubscription(sub);

      // Show welcome notification
      try {
        await registration.showNotification('Smart Market', {
          body: '🎉 Notifications enabled! You\'ll get alerts for deals & orders.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'welcome-notification',
          silent: false,
        });
      } catch (e) {
        console.warn('[Push] Welcome notification failed:', e);
      }

      return sub;
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
      return null;
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (user) {
        await supabase
          .from('notification_tokens' as any)
          .delete()
          .eq('token', subscription.endpoint);
      }

      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
    }
  }, [subscription, user]);

  // Auto-subscribe when notifications are already granted
  useEffect(() => {
    if (isSupported && !isSubscribed && 'Notification' in window && Notification.permission === 'granted') {
      subscribe();
    }
  }, [isSupported, isSubscribed, subscribe]);

  // Re-sync subscription when user logs in
  useEffect(() => {
    if (user && subscription) {
      storeSubscription(subscription);
    }
  }, [user]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
  };
};
