import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Store, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shop {
  id: string;
  name: string;
  logo_url: string | null;
  trading_center: string | null;
  seller_id: string;
  country: string | null;
}

interface ShopNearMeProps {
  userCountry?: string;
}

const ShopNearMe = ({ userCountry }: ShopNearMeProps) => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchShops();
  }, [userCountry]);

  const fetchShops = async () => {
    try {
      let query = supabase
        .from('shops')
        .select('id, name, logo_url, trading_center, seller_id, country')
        .eq('is_active', true)
        .limit(20);
      
      // Filter by country if specified
      if (userCountry) {
        query = query.eq('country', userCountry);
      }

      const { data } = await query;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (isPaused || shops.length <= 3) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % shops.length);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, shops.length]);

  // Scroll to current index
  useEffect(() => {
    if (scrollRef.current && shops.length > 0) {
      const cardWidth = 180;
      const gap = 12;
      scrollRef.current.scrollTo({
        left: currentIndex * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [currentIndex, shops.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + shops.length) % shops.length);
  }, [shops.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % shops.length);
  }, [shops.length]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Shops Near You
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[180px] shrink-0 h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <div 
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Shops Near You
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Previous shop"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Next shop"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {shops.map((shop, index) => (
          <button
            key={shop.id}
            onClick={() => navigate(`/shop/${shop.id}`)}
            className={cn(
              "w-[180px] shrink-0 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300",
              "flex flex-col items-center text-center gap-2"
            )}
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
              {shop.logo_url ? (
                <img 
                  src={shop.logo_url} 
                  alt={shop.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <span className="font-medium text-sm line-clamp-1">{shop.name}</span>
            {shop.trading_center && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {shop.trading_center}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      {shops.length > 3 && (
        <div className="flex justify-center gap-1.5">
          {shops.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to shop ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopNearMe;
