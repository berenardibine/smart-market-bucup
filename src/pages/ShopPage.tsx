import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import FloatingProductCard from '@/components/home/FloatingProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Phone, MessageCircle, ArrowLeft, Package } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  trading_center: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  rental_unit: string | null;
  sponsored: boolean | null;
  is_negotiable: boolean | null;
}

const ShopPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const LIMIT = 20;

  const fetchShop = useCallback(async () => {
    if (!shopId) return;
    
    try {
      const { data } = await supabase
        .from('shops')
        .select('id, name, description, logo_url, trading_center, contact_phone, whatsapp')
        .eq('id', shopId)
        .single();
      
      setShop(data);
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  }, [shopId]);

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    if (!shopId) return;
    
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data, count } = await supabase
        .from('products')
        .select('id, title, price, images, rental_unit, sponsored, is_negotiable', { count: 'exact' })
        .eq('status', 'active')
        .or(`seller_id.eq.${shop?.id}`)
        .range(pageNum * LIMIT, (pageNum + 1) * LIMIT - 1)
        .order('created_at', { ascending: false });

      // Actually fetch by shop's seller_id
      const { data: shopData } = await supabase
        .from('shops')
        .select('seller_id')
        .eq('id', shopId)
        .single();

      if (shopData?.seller_id) {
        const { data: productData, count: productCount } = await supabase
          .from('products')
          .select('id, title, price, images, rental_unit, sponsored, is_negotiable', { count: 'exact' })
          .eq('status', 'active')
          .eq('seller_id', shopData.seller_id)
          .range(pageNum * LIMIT, (pageNum + 1) * LIMIT - 1)
          .order('created_at', { ascending: false });

        if (append) {
          setProducts(prev => [...prev, ...(productData || [])]);
        } else {
          setProducts(productData || []);
        }
        setHasMore((productCount || 0) > (pageNum + 1) * LIMIT);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [shopId, shop?.id]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  useEffect(() => {
    if (shopId) {
      setPage(0);
      fetchProducts(0);
    }
  }, [shopId, fetchProducts]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const handleWhatsApp = () => {
    if (shop?.whatsapp) {
      window.open(`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleCall = () => {
    if (shop?.contact_phone) {
      window.open(`tel:${shop.contact_phone}`, '_self');
    }
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <Skeleton className="h-32 rounded-2xl mb-4" />
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-bold mb-2">Shop Not Found</h1>
        <p className="text-muted-foreground mb-4">This shop may have been removed.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg flex-1">{shop.name}</h1>
        </div>
      </div>

      {/* Shop Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="h-10 w-10 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{shop.name}</h2>
            {shop.trading_center && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {shop.trading_center}
              </p>
            )}
          </div>
        </div>

        {shop.description && (
          <p className="mt-4 text-sm text-muted-foreground">{shop.description}</p>
        )}

        {/* Contact Buttons */}
        <div className="flex gap-3 mt-4">
          {shop.contact_phone && (
            <Button variant="outline" onClick={handleCall} className="flex-1 gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}
          {shop.whatsapp && (
            <Button onClick={handleWhatsApp} className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Products ({products.length})
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl">
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No products yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((product) => (
                <FloatingProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  rentalUnit={product.rental_unit}
                  isSponsored={product.sponsored}
                  isNegotiable={product.is_negotiable}
                />
              ))}
            </div>

            {/* Infinite scroll loader */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-4">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav activeTab="home" onTabChange={() => {}} />
    </div>
  );
};

export default ShopPage;
