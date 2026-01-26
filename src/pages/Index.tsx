import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, ShoppingBag, Sparkles, Package, Clock, Zap, Star,
  Home, Wheat, Wrench, ChevronRight
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MenuDrawer from "@/components/layout/MenuDrawer";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import AdminFAB from "@/components/layout/AdminFAB";
import LocationModal from "@/components/location/LocationModal";
import ProductFilterBar, { ProductFilters } from "@/components/filters/ProductFilterBar";
import AIGreeting from "@/components/home/AIGreeting";
import DailyMotivation from "@/components/home/DailyMotivation";
import SmartChallenge from "@/components/home/SmartChallenge";
import FloatingProductCard from "@/components/home/FloatingProductCard";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import SectionHeader from "@/components/home/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useDynamicHomeFeed } from "@/hooks/useDynamicHomeFeed";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({ sortBy: 'random' });
  
  const { 
    showLocationModal, setShowLocationModal, 
    saveUserLocation
  } = useUserLocation();
  
  // Get dynamic home feed data
  const { 
    dynamicFeed,
    newArrivals,
    assetProducts,
    agricultureProducts,
    rentProducts,
    loading,
  } = useDynamicHomeFeed();

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

  // Featured Section Card
  const FeaturedSectionCard = ({
    title,
    icon: Icon,
    color,
    products,
    onViewAll,
  }: {
    title: string;
    icon: React.ElementType;
    color: string;
    products: any[];
    onViewAll: () => void;
  }) => (
    <div className="relative">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-t-2xl",
        `bg-gradient-to-r ${color}`
      )}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-white" />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-white hover:bg-white/20 gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Products */}
      <div className="bg-card rounded-b-2xl shadow-soft p-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {products.slice(0, 6).map((product) => (
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 pt-14">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="container px-4 py-4 space-y-5">
        {/* Smart Filter Bar */}
        <section className="animate-fade-up">
          <ProductFilterBar 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </section>
        {/*

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <FeaturedSectionCard
              title="✨ New Arrivals"
              icon={Clock}
              color="from-blue-500 to-cyan-400"
              products={newArrivals}
              onViewAll={() => navigate('/new-arrivals')}
            />
          </section>
        )}

        {/* Asset Section */}
        {assetProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <FeaturedSectionCard
              title="🏠 Assets"
              icon={Home}
              color="from-orange-500 to-amber-400"
              products={assetProducts}
              onViewAll={() => navigate('/assets')}
            />
          </section>
        )}

        {/* Agriculture Section */}
        {agricultureProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <FeaturedSectionCard
              title="🌾 Agriculture"
              icon={Wheat}
              color="from-green-500 to-emerald-400"
              products={agricultureProducts}
              onViewAll={() => navigate('/agriculture')}
            />
          </section>
        )}

        {/* Equipment for Rent Section */}
        {rentProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <FeaturedSectionCard
              title="🔧 Equipment for Rent"
              icon={Wrench}
              color="from-purple-500 to-violet-400"
              products={rentProducts}
              onViewAll={() => navigate('/rent')}
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
              <p className="text-muted-foreground">No products available yet. Check back soon!</p>
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
            🛍️ Your Market. Your Area. Your Power.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Smart Market — Buy Smart, Live Smart.
          </p>
        </section>
      </main>

      {isSeller && <SellerFAB />}
      <AdminFAB />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <LocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)}
        onSave={saveUserLocation}
      />
    </div>
  );
};

export default Index;
