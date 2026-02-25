import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Store, MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shop {
  id: string;
  name: string;
  logo_url: string | null;
  trading_center: string | null;
  seller_id: string;
  country: string | null;
  description: string | null;
  product_count?: number;
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
        .select('id, name, logo_url, trading_center, seller_id, country, description')
        .eq('is_active', true)
        .limit(20);
      
      if (userCountry) {
        query = query.eq('country', userCountry);
      }

      const { data } = await query;
      
      if ((!data || data.length === 0) && userCountry) {
        const { data: allShops } = await supabase
          .from('shops')
          .select('id, name, logo_url, trading_center, seller_id, country, description')
          .eq('is_active', true)
          .limit(20);
        setShops(allShops || []);
      } else {
        setShops(data || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPaused || shops.length <= 2) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % shops.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, shops.length]);

  useEffect(() => {
    if (scrollRef.current && shops.length > 0) {
      const cardWidth = 220;
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
          Featured Shops
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[220px] shrink-0 h-36 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (shops.length === 0) return null;

  const coverStyles = [
    'from-primary/90 to-primary',
    'from-secondary to-secondary/70',
    'from-accent to-accent/70',
    'from-muted to-muted/70',
  ];

  return (
    <div 
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          Featured Shops
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-card border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-card border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
      >
        {shops.map((shop, index) => (
          <button
            key={shop.id}
            onClick={() => navigate(`/shop/${shop.id}`)}
            className={cn(
              "w-[240px] shrink-0 rounded-3xl border bg-card overflow-hidden",
              "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group text-left"
            )}
          >
            <div className="relative h-28 overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  coverStyles[index % coverStyles.length]
                )}
              />
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={`${shop.name} logo`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Store className="h-11 w-11 text-primary-foreground/85" />
                </div>
              )}

              <div className="absolute left-3 right-3 -bottom-8 flex items-end justify-between">
                <div className="h-16 w-16 rounded-2xl border border-border bg-background/95 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-md">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Store className="h-7 w-7 text-primary" />
                  )}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-semibold text-foreground border border-border shadow-sm">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  Trusted
                </span>
              </div>
            </div>

            <div className="px-3 pb-3 pt-10">
              <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {shop.name}
              </h4>
              {shop.trading_center && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{shop.trading_center}</span>
                </p>
              )}
              {shop.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 min-h-[32px]">
                  {shop.description}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground">
                  Explore shop
                </span>
                <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Dots */}
      {shops.length > 2 && (
        <div className="flex justify-center gap-1.5">
          {shops.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/20 w-1.5 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopNearMe;
