import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FloatingProductCard from './FloatingProductCard';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  rental_unit?: string | null;
  sponsored?: boolean | null;
  admin_posted?: boolean | null;
}

interface CategoryCarouselProps {
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  categoryColor: string;
  products: Product[];
  autoScrollInterval?: number;
}

const CategoryCarousel = ({
  categoryName,
  categorySlug,
  categoryIcon,
  categoryColor,
  products,
  autoScrollInterval = 4000, // Changed to 4 seconds
}: CategoryCarouselProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logic - every 4 seconds
  useEffect(() => {
    if (products.length <= 2 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          // Reset to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (roughly 180px)
          const newPosition = scrollLeft + 180;
          scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
        }
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [products.length, isPaused, autoScrollInterval]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <div 
      className="py-5 animate-fade-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      {/* Header with gradient */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-2xl",
        `bg-gradient-to-r ${categoryColor}`
      )}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryIcon}</span>
          <h3 className="font-bold text-white text-lg">{categoryName}</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/category/${categorySlug}`)}
          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 gap-1 rounded-full"
        >
          View More
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel Container */}
      <div className="relative bg-card rounded-b-2xl shadow-soft p-4">
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Products */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[160px] shrink-0">
              <FloatingProductCard
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                rentalUnit={product.rental_unit}
                isSponsored={product.admin_posted ? false : product.sponsored}
                hideSponsored={product.admin_posted}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 shadow-md flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoryCarousel;