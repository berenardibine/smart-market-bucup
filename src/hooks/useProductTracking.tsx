import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

const SUPABASE_URL = "https://tbykrulfzhhkmtgjhvjh.supabase.co";

// Generate or retrieve a persistent session ID for guests
const getSessionId = (): string => {
  const storageKey = 'smart_market_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

// Track impression timestamps to avoid duplicate calls
const getImpressionKey = (productId: string) => `impression_${productId}`;
const getViewKey = (productId: string) => `view_${productId}`;

const hasRecentImpression = (productId: string): boolean => {
  const key = getImpressionKey(productId);
  const timestamp = localStorage.getItem(key);
  if (!timestamp) return false;
  
  const hourAgo = Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds
  return parseInt(timestamp) > hourAgo;
};

const hasRecentView = (productId: string): boolean => {
  const key = getViewKey(productId);
  const timestamp = localStorage.getItem(key);
  if (!timestamp) return false;
  
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000); // 10 minutes in milliseconds
  return parseInt(timestamp) > tenMinutesAgo;
};

const markImpression = (productId: string) => {
  localStorage.setItem(getImpressionKey(productId), Date.now().toString());
};

const markView = (productId: string) => {
  localStorage.setItem(getViewKey(productId), Date.now().toString());
};

// Queue for batching impression calls
let impressionQueue: Array<{ productId: string; userId?: string; sessionId: string; refSource: string }> = [];
let viewQueue: Array<{ productId: string; userId?: string; sessionId: string; refSource: string }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

const flushImpressionQueue = async () => {
  if (impressionQueue.length === 0) return;
  
  const batch = [...impressionQueue];
  impressionQueue = [];
  
  // Send impressions in parallel (max 5 at a time)
  const chunks = [];
  for (let i = 0; i < batch.length; i += 5) {
    chunks.push(batch.slice(i, i + 5));
  }
  
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(item => 
        fetch(`${SUPABASE_URL}/functions/v1/record-impression`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        }).catch(err => console.error('Impression tracking error:', err))
      )
    );
  }
};

const flushViewQueue = async () => {
  if (viewQueue.length === 0) return;
  
  const batch = [...viewQueue];
  viewQueue = [];
  
  await Promise.all(
    batch.map(item => 
      fetch(`${SUPABASE_URL}/functions/v1/record-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(err => console.error('View tracking error:', err))
    )
  );
};

const scheduleFlush = () => {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushImpressionQueue();
    flushViewQueue();
  }, 1000); // Debounce for 1 second
};

export const useProductTracking = () => {
  const { user } = useAuth();
  const sessionId = getSessionId();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trackedElements = useRef<Map<string, Element>>(new Map());

  // Record an impression
  const recordImpression = useCallback((productId: string, refSource: string = 'home') => {
    if (hasRecentImpression(productId)) return;
    
    markImpression(productId);
    impressionQueue.push({
      productId,
      userId: user?.id,
      sessionId,
      refSource
    });
    scheduleFlush();
  }, [user?.id, sessionId]);

  // Record a view
  const recordView = useCallback((productId: string, refSource: string = 'direct') => {
    if (hasRecentView(productId)) return;
    
    markView(productId);
    viewQueue.push({
      productId,
      userId: user?.id,
      sessionId,
      refSource
    });
    scheduleFlush();
  }, [user?.id, sessionId]);

  // Setup intersection observer for tracking impressions
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id');
            const refSource = entry.target.getAttribute('data-ref-source') || 'home';
            
            if (productId) {
              recordImpression(productId, refSource);
            }
          }
        });
      },
      {
        threshold: 0.5, // At least 50% visible
        rootMargin: '0px'
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [recordImpression]);

  // Track an element for impression monitoring
  const trackElement = useCallback((element: Element | null, productId: string, refSource: string = 'home') => {
    if (!element || !observerRef.current) return;
    
    element.setAttribute('data-product-id', productId);
    element.setAttribute('data-ref-source', refSource);
    
    if (!trackedElements.current.has(productId)) {
      trackedElements.current.set(productId, element);
      observerRef.current.observe(element);
    }
  }, []);

  // Untrack an element
  const untrackElement = useCallback((productId: string) => {
    const element = trackedElements.current.get(productId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      trackedElements.current.delete(productId);
    }
  }, []);

  return {
    recordImpression,
    recordView,
    trackElement,
    untrackElement,
    sessionId
  };
};

// Hook for tracking a single product view (used on product detail page)
export const useProductViewTracking = (productId: string | undefined, refSource: string = 'direct') => {
  const { recordView } = useProductTracking();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (productId && !hasTracked.current) {
      hasTracked.current = true;
      recordView(productId, refSource);
    }
  }, [productId, recordView, refSource]);
};

// Component wrapper for tracking impressions via ref
export const useImpressionTracker = (productId: string, refSource: string = 'home') => {
  const { trackElement, untrackElement } = useProductTracking();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current && productId) {
      trackElement(elementRef.current, productId, refSource);
    }

    return () => {
      if (productId) {
        untrackElement(productId);
      }
    };
  }, [productId, refSource, trackElement, untrackElement]);

  return elementRef;
};
