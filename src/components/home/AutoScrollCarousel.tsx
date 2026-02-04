import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingProductCard from './FloatingProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  rental_unit?: string | null;
  sponsored?: boolean | null;
  admin_posted?: boolean | null;
  is_negotiable?: boolean | null;
}

interface AutoScrollCarouselProps {
  title: string;
  icon: string;
  color: string;
  products: Product[];
  viewAllLink?: string;
  autoScrollInterval?: number;
}

const AutoScrollCarousel = ({ 
  title, 
  icon, 
  color, 
  products, 
  viewAllLink,
  autoScrollInterval = 3000
}: AutoScrollCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (isPaused || products.length <= 2) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % products.length);
    }, autoScrollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, products.length, autoScrollInterval]);

  // Scroll to current index
  useEffect(() => {
    if (scrollRef.current && products.length > 0) {
      const cardWidth = 160;
      const gap = 12;
      scrollRef.current.scrollTo({
        left: currentIndex * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [currentIndex, products.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-2xl",
        `bg-gradient-to-r ${color}`
      )}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 2 && (
            <>
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </>
          )}
          {viewAllLink && (
            <button
              onClick={() => navigate(viewAllLink)}
              className="text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              View All →
            </button>
          )}
        </div>
      </div>
      
      {/* Products */}
      <div className="bg-card rounded-b-2xl shadow-soft p-3">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[160px] shrink-0">
              <FloatingProductCard
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                rentalUnit={product.rental_unit}
                isSponsored={product.sponsored}
                isAdminPosted={product.admin_posted}
                isNegotiable={product.is_negotiable}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {products.length > 3 && (
          <div className="flex justify-center gap-1 mt-3">
            {products.slice(0, Math.min(products.length, 8)).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  index === currentIndex % Math.min(products.length, 8)
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30"
                )}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoScrollCarousel;
