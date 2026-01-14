import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ShoppingBag, Sparkles, Package } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MenuDrawer from "@/components/layout/MenuDrawer";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import AdminFAB from "@/components/layout/AdminFAB";
import SmartLocationHeader from "@/components/location/SmartLocationHeader";
import LocationLevelFilter from "@/components/location/LocationLevelFilter";
import LocationModal from "@/components/location/LocationModal";
import AIGreeting from "@/components/home/AIGreeting";
import DailyMotivation from "@/components/home/DailyMotivation";
import SmartChallenge from "@/components/home/SmartChallenge";
import FloatingProductCard from "@/components/home/FloatingProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRandomizedProducts } from "@/hooks/useRandomizedProducts";
import { useCategories } from "@/hooks/useCategories";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { 
    level, setLevel, 
    showLocationModal, setShowLocationModal, 
    saveUserLocation, getLocationLabel 
  } = useUserLocation();
  
  // Get categories from database for general type
  const { categories: dbCategories, loading: categoriesLoading } = useCategories('general');
  
  // Get randomized products
  const { products: allProducts, loading: productsLoading } = useRandomizedProducts(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  const isSeller = profile?.user_type === 'seller';

  // Build categories list with "All" option
  const homeCategories = useMemo(() => {
    const allOption = { 
      id: 'all', 
      name: 'All', 
      slug: 'all', 
      icon: '✨', 
      type: 'general',
      color: 'from-primary to-orange-400' 
    };
    
    const colors = [
      'from-pink-500 to-rose-400',
      'from-blue-500 to-cyan-400',
      'from-amber-500 to-yellow-400',
      'from-red-500 to-pink-400',
      'from-indigo-500 to-violet-400',
      'from-gray-600 to-slate-500',
      'from-green-500 to-emerald-400',
      'from-purple-500 to-violet-400',
    ];
    
    const processedCategories = dbCategories.map((cat, index) => ({
      ...cat,
      color: colors[index % colors.length]
    }));
    
    return [allOption, ...processedCategories];
  }, [dbCategories]);

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'asset') navigate('/assets');
    else if (tab === 'agriculture') navigate('/agriculture');
    else if (tab === 'rent') navigate('/rent');
  };

  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl p-3 space-y-3 shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
      <Skeleton className="aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 pt-14">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="container px-4 py-4 space-y-5">
        {/* Smart Location Header */}
        <section className="animate-fade-up">
          <SmartLocationHeader 
            locationLabel={getLocationLabel()} 
            onChangeLocation={() => setShowLocationModal(true)} 
          />
        </section>

        {/* Location Level Filter */}
        <section className="animate-fade-up" style={{ animationDelay: "0.03s" }}>
          <LocationLevelFilter level={level} onLevelChange={setLevel} />
        </section>

        {/* AI Greeting */}
        <section className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <AIGreeting />
        </section>

        {/* Daily Motivation */}
        <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <DailyMotivation />
        </section>

        {/* Smart Challenge */}
        <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <SmartChallenge />
        </section>

        {/* Category Filter - Database driven */}
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {categoriesLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
              ))
            ) : (
              homeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                    selectedCategory === cat.slug
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-primary/20`
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Products Count */}
        {!productsLoading && allProducts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.22s" }}>
            <div className="flex items-center gap-2 px-1">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{allProducts.length}</span> products available
              </span>
            </div>
          </section>
        )}

        {/* Trending Products - Modern Floating Cards */}
        <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <SectionHeader
            title="Trending Now"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {allProducts.slice(0, 12).map((product) => (
                <FloatingProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  rating={0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No products yet. Be the first to sell!</p>
            </div>
          )}
        </section>

        {/* More Products */}
        {allProducts.length > 12 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <SectionHeader
              title="More for You"
              icon={<ShoppingBag className="h-4 w-4 text-primary" />}
              onViewAll={() => {}}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {allProducts.slice(12).map((product) => (
                <FloatingProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  rating={0}
                />
              ))}
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
