import { Star, ChevronRight, Clock } from 'lucide-react';
import FloatingProductCard from './FloatingProductCard';
import { useFeaturedProducts } from '@/hooks/useReferral';
import { cn } from '@/lib/utils';

interface FeaturedProductsProps {
  userCountry?: string | null;
}

const FeaturedProducts = ({ userCountry }: FeaturedProductsProps) => {
  const { featuredProducts, loading } = useFeaturedProducts(userCountry);

  if (loading || featuredProducts.length === 0) return null;

  return (
    <section className="animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Star className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Featured Products</h3>
            <p className="text-[10px] text-muted-foreground">Promoted by referrals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {featuredProducts.map((product) => (
          <div key={product.id} className="relative">
            <FloatingProductCard
              id={product.id}
              slug={product.slug}
              title={product.title}
              price={product.price}
              images={product.images}
              rentalUnit={product.rental_unit}
              isSponsored={false}
              isNegotiable={product.is_negotiable}
              currencySymbol={product.currency_symbol}
              refSource="featured"
            />
            {/* Featured Badge */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
              <Star className="h-2.5 w-2.5" />
              Featured
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
