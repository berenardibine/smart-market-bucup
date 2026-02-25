import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import SearchModal from '@/components/layout/SearchModal';
import SellerFAB from '@/components/layout/SellerFAB';
import AdminFAB from '@/components/layout/AdminFAB';
import FloatingProductCard from '@/components/home/FloatingProductCard';
import HomeAds from '@/components/home/HomeAds';
import ProductFilterBar, { ProductFilters } from '@/components/filters/ProductFilterBar';
import PageMetaTags from '@/components/seo/PageMetaTags';
import { useAuth } from '@/hooks/useAuth';
import { useGeo } from '@/context/GeoContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  rental_unit: string | null;
  sponsored: boolean | null;
  admin_posted: boolean | null;
  is_negotiable: boolean | null;
  currency_symbol: string | null;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { country } = useGeo();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'random' });

  const isSeller = profile?.user_type === 'seller';

  useEffect(() => {
    if (slug) fetchCategoryProducts();
  }, [slug, country]);

  const fetchCategoryProducts = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug, icon, seo_title, seo_description, seo_image')
          .eq('slug', slug)
          .maybeSingle(),
        supabase
          .from('products')
          .select('id, title, price, images, rental_unit, sponsored, admin_posted, is_negotiable, currency_symbol')
          .eq('status', 'active')
          .eq('category', slug)
          .order('created_at', { ascending: false })
      ]);

      if (catRes.data) setCategory(catRes.data);
      setProducts(prodRes.data || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      default: return 0;
    }
  });

  const ProductSkeleton = () => (
    <div className="bg-card rounded-2xl p-3 space-y-3 shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );

  const metaTitle = category?.seo_title || `${category?.name || 'Category'} | Smart Market`;
  const metaDescription = category?.seo_description || `Explore the best ${category?.name || ''} products on Smart Market. Find high-quality items available worldwide.`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-8 pt-14">
      {category && (
        <PageMetaTags
          title={metaTitle}
          description={metaDescription}
          image={category.seo_image || undefined}
          url={`/category/${category.slug}`}
        />
      )}
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      <main className="container px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-xl">
            {category?.icon || '📦'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{category?.name || 'Category'}</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <HomeAds />
        <ProductFilterBar filters={filters} onFiltersChange={setFilters} />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedProducts.map((product) => (
              <FloatingProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                rentalUnit={product.rental_unit}
                isSponsored={product.sponsored}
                isAdminPosted={product.admin_posted}
                isNegotiable={product.is_negotiable}
                currencySymbol={product.currency_symbol}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Sparkles className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Products Yet</h3>
            <p className="text-muted-foreground">
              Be the first to list products in {category?.name || 'this category'}!
            </p>
          </div>
        )}
      </main>

      {isSeller && <SellerFAB />}
      <AdminFAB />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default CategoryPage;
