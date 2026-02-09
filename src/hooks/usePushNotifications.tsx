import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const VAPID_PUBLIC_KEY = 'BJQLmyHGaCpq_n_BhNqefS1x1MoK4DqjkAC793XzKEhaA3OmVOOx1OyjjB-HI7XqsCqarTmncXH4B_v4mGKJecw';

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
      }
    } catch (err) {
      console.error('[Push] Error checking subscription:', err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Store subscription in Supabase
      if (user) {
        const subJson = sub.toJSON();
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh: subJson.keys?.p256dh || '',
            auth: subJson.keys?.auth || '',
          }, { onConflict: 'endpoint' });
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

      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
      }

      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
    }
  }, [subscription, user]);

  // Auto-subscribe when user logs in and notifications are granted
  useEffect(() => {
    if (user && isSupported && !isSubscribed && Notification.permission === 'granted') {
      subscribe();
    }
  }, [user, isSupported, isSubscribed, subscribe]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
  };
};
