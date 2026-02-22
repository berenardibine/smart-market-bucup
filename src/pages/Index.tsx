import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Globe, TrendingUp, Zap
} from "lucide-react";
import Header from "@/components/layout/Header";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import AdminFAB from "@/components/layout/AdminFAB";
import GlobalLocationModal from "@/components/location/GlobalLocationModal";
import LocationPermissionBanner from "@/components/location/LocationPermissionBanner";
import HomeAds from "@/components/home/HomeAds";
import FloatingProductCard from "@/components/home/FloatingProductCard";
import AutoScrollCarousel from "@/components/home/AutoScrollCarousel";
import ShopNearMe from "@/components/home/ShopNearMe";
import NearbyProducts from "@/components/home/NearbyProducts";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ReferralBanner from "@/components/referral/ReferralBanner";
import SectionHeader from "@/components/home/SectionHeader";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import { useAuth } from "@/hooks/useAuth";
import { useDynamicHomeFeed } from "@/hooks/useDynamicHomeFeed";
import { useGeo } from "@/context/GeoContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showGlobalProducts, setShowGlobalProducts] = useState(false);
  
  const { 
    dynamicFeed,
    newArrivals,
    categorySections,
    loading,
  } = useDynamicHomeFeed(showGlobalProducts ? null : country);

  const isSeller = profile?.user_type === 'seller';

  const ProductSkeleton = () => (
    <div className="bg-card rounded-2xl p-3 space-y-3 shadow-sm border border-border/30">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-8 pt-14">
      <Header onSearchClick={() => setIsSearchOpen(true)} />
      
      <main className="container px-4 py-4 space-y-6">
        {/* Location Header */}
        <section className="animate-fade-up">
          <button
            onClick={() => setShowLocationModal(true)}
            className={cn(
              "w-full flex items-center gap-3 p-3.5 rounded-2xl",
              "bg-gradient-to-r from-primary/8 via-secondary/5 to-primary/8",
              "border border-primary/15 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
            )}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <span className="text-xl">{getCountryFlag(countryCode)}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[11px] text-muted-foreground font-medium">
                {showGlobalProducts ? '🌍 Showing products from' : '📍 Products near you in'}
              </p>
              <p className="font-bold text-foreground text-sm">
                {geoLoading ? 'Detecting...' : (showGlobalProducts ? 'All Countries' : country || 'Select Location')}
                {currencySymbol && !showGlobalProducts && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({currencySymbol})</span>
                )}
              </p>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex justify-center mt-2.5">
            <button
              onClick={() => setShowGlobalProducts(!showGlobalProducts)}
              className={cn(
                "text-xs px-4 py-1.5 rounded-full transition-all font-medium shadow-sm",
                showGlobalProducts 
                  ? "bg-primary text-primary-foreground shadow-primary/20" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {showGlobalProducts ? '🌍 Showing Global' : '🔄 Show Global'}
            </button>
          </div>
        </section>

        {/* Permission Banner */}
        {permissionDenied && (
          <section className="animate-fade-up">
            <LocationPermissionBanner onRequestPermission={requestLocationPermission} />
          </section>
        )}

        <ReferralBanner />

        {/* Ads */}
        <section className="animate-fade-up">
          <HomeAds />
        </section>

        {/* Featured */}
        <FeaturedProducts userCountry={showGlobalProducts ? null : country} />

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <AutoScrollCarousel
              title="New Arrivals"
              icon="✨"
              color="from-blue-600 to-cyan-500"
              products={newArrivals}
              viewAllLink="/category/new-arrivals"
              autoScrollInterval={3000}
            />
          </section>
        )}

        {/* Category Sections */}
        {!loading && categorySections.map((section, idx) => (
          <section key={section.category.slug} className="animate-fade-up" style={{ animationDelay: `${0.18 + idx * 0.03}s` }}>
            <AutoScrollCarousel
              title={section.category.name}
              icon={section.category.icon || '📦'}
              color={section.color}
              products={section.products}
              viewAllLink={`/category/${section.category.slug}`}
              autoScrollInterval={3500 + idx * 500}
            />
          </section>
        ))}

        {/* Nearby */}
        <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <NearbyProducts
            lat={lat}
            lng={lng}
            permissionDenied={permissionDenied}
            onRequestPermission={requestLocationPermission}
          />
        </section>

        {/* Shop Near Me */}
        <section className="animate-fade-up" style={{ animationDelay: "0.28s" }}>
          <ShopNearMe userCountry={showGlobalProducts ? undefined : country || undefined} />
        </section>

        {/* Dynamic Feed */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">Explore Products</h2>
              <p className="text-[10px] text-muted-foreground">Discover something new</p>
            </div>
          </div>

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

        {/* Bottom Ads */}
        <section className="animate-fade-up">
          <HomeAds />
        </section>

        {/* Empty State */}
        {!loading && dynamicFeed.length === 0 && (
          <section className="animate-fade-up">
            <div className="text-center py-16 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl border border-border/30">
              <Sparkles className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {showGlobalProducts 
                  ? 'No products available yet. Check back soon!' 
                  : `No products in ${country || 'your area'}.`
                }
              </p>
              {!showGlobalProducts && (
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full"
                  onClick={() => setShowGlobalProducts(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Show Global Products
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <section className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Smart Shopping</span>
          </div>
        </section>
      </main>

      {isSeller && <SellerFAB />}
      <AdminFAB />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <GlobalLocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default Index;
