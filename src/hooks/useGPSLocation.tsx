import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GPSCoords {
  lat: number;
  lng: number;
  accuracy: number;
  source: 'gps' | 'ip' | 'manual';
  country?: string;
  city?: string;
  region?: string;
}

const GPS_CACHE_KEY = 'smartmarket_gps';
const GPS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Round to ~100m precision for privacy
const roundCoord = (n: number) => Math.round(n * 10000) / 10000;

export const useGPSLocation = () => {
  const { user, profile } = useAuth();
  const [coords, setCoords] = useState<GPSCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Load cached GPS data
  useEffect(() => {
    const cached = localStorage.getItem(GPS_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < GPS_CACHE_DURATION) {
          setCoords({
            lat: parsed.lat,
            lng: parsed.lng,
            accuracy: parsed.accuracy,
            source: parsed.source,
            country: parsed.country,
            city: parsed.city,
            region: parsed.region,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        // Invalid cache
      }
    }
    detectLocation();
  }, []);

  // Background refresh every 15 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        detectLocation(true);
      }
    }, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const detectLocation = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    // Throttle: don't update more than once per 30 minutes
    if (Date.now() - lastUpdateRef.current < GPS_CACHE_DURATION) {
      if (!silent) setLoading(false);
      return;
    }

    try {
      // Try browser GPS first
      const gpsResult = await tryBrowserGPS();
      if (gpsResult) {
        // Enrich with IP data for country/city info
        const ipData = await fetchIPLocation();
        const enriched: GPSCoords = {
          ...gpsResult,
          country: ipData?.country || undefined,
          city: ipData?.city || undefined,
          region: ipData?.region || undefined,
        };
        
        setCoords(enriched);
        cacheCoords(enriched);
        lastUpdateRef.current = Date.now();
        
        // Save to DB for sellers
        if (user && profile?.user_type === 'seller') {
          await saveLocationToDB(enriched);
        }
        
        setLoading(false);
        return;
      }
    } catch {
      // GPS failed, fall through to IP
    }

    // Fallback to IP geolocation
    try {
      const ipData = await fetchIPLocation();
      if (ipData) {
        const ipCoords: GPSCoords = {
          lat: roundCoord(ipData.latitude),
          lng: roundCoord(ipData.longitude),
          accuracy: 50000, // ~50km accuracy for IP
          source: 'ip',
          country: ipData.country,
          city: ipData.city,
          region: ipData.region,
        };
        
        setCoords(ipCoords);
        cacheCoords(ipCoords);
        lastUpdateRef.current = Date.now();
        
        // Save to DB for sellers
        if (user && profile?.user_type === 'seller') {
          await saveLocationToDB(ipCoords);
        }
      }
    } catch (err) {
      console.error('IP geolocation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const tryBrowserGPS = (): Promise<GPSCoords | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionDenied(false);
          resolve({
            lat: roundCoord(position.coords.latitude),
            lng: roundCoord(position.coords.longitude),
            accuracy: position.coords.accuracy,
            source: 'gps',
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: GPS_CACHE_DURATION,
        }
      );
    });
  };

  const fetchIPLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('IP API failed');
      const data = await response.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country_name,
        city: data.city,
        region: data.region,
        ip: data.ip,
        countryCode: data.country_code,
      };
    } catch {
      return null;
    }
  };

  const cacheCoords = (data: GPSCoords) => {
    localStorage.setItem(
      GPS_CACHE_KEY,
      JSON.stringify({ ...data, timestamp: Date.now() })
    );
    // Also store in session for quick access
    sessionStorage.setItem('user_lat', String(data.lat));
    sessionStorage.setItem('user_lng', String(data.lng));
  };

  const saveLocationToDB = async (data: GPSCoords) => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({
          lat: data.lat,
          lng: data.lng,
          city: data.city || null,
          region: data.region || null,
          last_location_update: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      // Also update seller's products with coordinates
      await supabase
        .from('products')
        .update({ lat: data.lat, lng: data.lng })
        .eq('seller_id', user.id)
        .is('lat', null);
      
      // Update seller's shop
      await supabase
        .from('shops')
        .update({
          lat: data.lat,
          lng: data.lng,
          city: data.city || null,
          region: data.region || null,
        })
        .eq('seller_id', user.id);
    } catch (err) {
      console.error('Failed to save location to DB:', err);
    }
  };

  const requestPermission = useCallback(async () => {
    setPermissionDenied(false);
    lastUpdateRef.current = 0; // Reset throttle
    await detectLocation();
  }, [detectLocation]);

  return {
    coords,
    loading,
    permissionDenied,
    requestPermission,
    refresh: () => {
      lastUpdateRef.current = 0;
      detectLocation();
    },
  };
};

export default useGPSLocation;
