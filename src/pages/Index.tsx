import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, ShoppingBag, Sparkles, Package, Clock, Zap, Star,
  Home, Wheat, Wrench, ChevronRight, Globe
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import AdminFAB from "@/components/layout/AdminFAB";
import GlobalLocationModal from "@/components/location/GlobalLocationModal";
import LocationPermissionBanner from "@/components/location/LocationPermissionBanner";
import ProductFilterBar, { ProductFilters } from "@/components/filters/ProductFilterBar";
import HomeAds from "@/components/home/HomeAds";
import FloatingProductCard from "@/components/home/FloatingProductCard";
import AutoScrollCarousel from "@/components/home/AutoScrollCarousel";
import ShopNearMe from "@/components/home/ShopNearMe";
import NearbyProducts from "@/components/home/NearbyProducts";
import SectionHeader from "@/components/home/SectionHeader";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import { useAuth } from "@/hooks/useAuth";
import { useDynamicHomeFeed } from "@/hooks/useDynamicHomeFeed";
import { useGeo } from "@/context/GeoContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Get country flag emoji
const getCountryFlag = (code: string | null) => {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { country, countryCode, currencySymbol, lat, lng, permissionDenied, requestLocationPermission, loading: geoLoading } = useGeo();
  const [activeTab, setActiveTab] = useState("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'random' });
  const [showGlobalProducts, setShowGlobalProducts] = useState(false);
  
  // Get dynamic home feed data - filtered by user's country unless showing global
  const { 
    dynamicFeed,
    newArrivals,
    assetProducts,
    agricultureProducts,
    rentProducts,
    loading,
  } = useDynamicHomeFeed(showGlobalProducts ? null : country);

  const isSeller = profile?.user_type === 'seller';

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'asset') navigate('/assets');
    else if (tab === 'agriculture') navigate('/agriculture');
    else if (tab === 'rent') navigate('/rent');
  };

  const ProductSkeleton = () => (
    <div className="bg-card rounded-2xl p-3 space-y-3 shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 pt-14">
      <Header
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="container px-4 py-4 space-y-5">
        {/* Global Location Header */}
        <section className="animate-fade-up">
          <button
            onClick={() => setShowLocationModal(true)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl",
              "bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5",
              "border border-primary/20 hover:border-primary/40 transition-all"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <span className="text-xl">{getCountryFlag(countryCode)}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-muted-foreground">
                {showGlobalProducts ? '🌍 Showing products from' : '📍 Products near you in'}
              </p>
              <p className="font-semibold text-foreground">
                {geoLoading ? 'Detecting...' : (showGlobalProducts ? 'All Countries' : country || 'Select Location')}
                {currencySymbol && !showGlobalProducts && (
                  <span className="ml-2 text-xs text-muted-foreground">({currencySymbol})</span>
                )}
              </p>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Toggle for global products */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowGlobalProducts(!showGlobalProducts)}
              className={cn(
                "text-xs px-3 py-1 rounded-full transition-colors",
                showGlobalProducts 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {showGlobalProducts ? '🌍 Showing Global Products' : '🔄 Show Global Products'}
            </button>
          </div>
        </section>

        {/* Location Permission Banner (shown only if denied) */}
        {permissionDenied && (
          <section className="animate-fade-up">
            <LocationPermissionBanner onRequestPermission={requestLocationPermission} />
          </section>
        )}

        {/* Smart Ads at Top */}
        <section className="animate-fade-up">
          <HomeAds />
        </section>

        {/* Smart Filter Bar 
        <section className="animate-fade-up">
          <ProductFilterBar 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </section> */}

        {/* New Arrivals Section - Auto-scroll */}
        {newArrivals.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <AutoScrollCarousel
              title="New Arrivals"
              icon="✨"
              color="from-blue-500 to-cyan-400"
              products={newArrivals}
              viewAllLink="/new-arrivals"
              autoScrollInterval={3000}
            />
          </section>
        )}

        {/* Products Near You - GPS based */}
        <section className="animate-fade-up" style={{ animationDelay: "0.22s" }}>
          <NearbyProducts
            lat={lat}
            lng={lng}
            permissionDenied={permissionDenied}
            onRequestPermission={requestLocationPermission}
          />
        </section>

        {/* Shop Near Me Section */}
        <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <ShopNearMe userCountry={showGlobalProducts ? undefined : country || undefined} />
        </section>

        {/* Asset Section - Auto-scroll */}
        {assetProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <AutoScrollCarousel
              title="Assets"
              icon="🏠"
              color="from-orange-500 to-amber-400"
              products={assetProducts}
              viewAllLink="/assets"
              autoScrollInterval={3000}
            />
          </section>
        )}

        {/* Agriculture Section - Auto-scroll */}
        {agricultureProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <AutoScrollCarousel
              title="Agriculture"
              icon="🌾"
              color="from-green-500 to-emerald-400"
              products={agricultureProducts}
              viewAllLink="/agriculture"
              autoScrollInterval={3000}
            />
          </section>
        )}

        {/* Equipment for Rent Section - Auto-scroll */}
        {rentProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <AutoScrollCarousel
              title="Equipment for Rent"
              icon="🔧"
              color="from-purple-500 to-violet-400"
              products={rentProducts}
              viewAllLink="/rent"
              autoScrollInterval={3000}
            />
          </section>
        )}

        {/* Dynamic Feed - Random Products with Category Sections */}
        <section className="space-y-4">
          <SectionHeader
            title="🔀 Explore Products"
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-6">
              {dynamicFeed.map((item, index) => (
                <div key={`feed-${index}`}>
                  {item.type === 'products' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {(item.data as any[]).map((product) => (
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
                    <CategoryCarousel
                      categoryName={(item.data as any).category.name}
                      categorySlug={(item.data as any).category.slug}
                      categoryIcon={(item.data as any).category.icon || '📦'}
                      categoryColor={(item.data as any).color}
                      products={(item.data as any).products}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Empty State */}
        {!loading && dynamicFeed.length === 0 && (
          <section className="animate-fade-up">
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {showGlobalProducts 
                  ? 'No products available yet. Check back soon!' 
                  : `No products in ${country || 'your area'}. Try showing global products!`
                }
              </p>
              {!showGlobalProducts && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowGlobalProducts(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Show Global Products
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Tagline Footer */}
        <section className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Shopping</span>
          </div>
          <p className="text-sm text-muted-foreground">
            🌍 Your Global Marketplace
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Smart Market — Buy Smart, Live Smart.
          </p>
        </section>
      </main>

      {isSeller && <SellerFAB />}
      <AdminFAB />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <GlobalLocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default Index;
