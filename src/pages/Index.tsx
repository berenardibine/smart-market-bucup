import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Store, ShoppingBag, Sparkles, Laptop, UtensilsCrossed, Heart, BookOpen, Settings } from "lucide-react";
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
import ProductCard from "@/components/products/ProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// General categories for home page (excluding asset, agriculture, rent)
const homeCategories = [
  { id: 'all', label: 'All', icon: <Sparkles className="h-4 w-4" />, color: 'from-primary to-orange-400' },
  { id: 'general', label: 'General', icon: <ShoppingBag className="h-4 w-4" />, color: 'from-pink-500 to-rose-400' },
  { id: 'electronics', label: 'Electronics', icon: <Laptop className="h-4 w-4" />, color: 'from-blue-500 to-cyan-400' },
  { id: 'food-drinks', label: 'Food', icon: <UtensilsCrossed className="h-4 w-4" />, color: 'from-amber-500 to-yellow-400' },
  { id: 'health-care', label: 'Health', icon: <Heart className="h-4 w-4" />, color: 'from-red-500 to-pink-400' },
  { id: 'education', label: 'Education', icon: <BookOpen className="h-4 w-4" />, color: 'from-indigo-500 to-violet-400' },
  { id: 'services', label: 'Services', icon: <Settings className="h-4 w-4" />, color: 'from-gray-600 to-slate-500' },
];

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
  
  // Get products excluding asset, agriculture, and rent types
  const { products: allProducts, loading: productsLoading } = useProducts(
    selectedCategory === 'all' ? 'general' : selectedCategory
  );

  const isSeller = profile?.user_type === 'seller';

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'asset') navigate('/assets');
    else if (tab === 'agriculture') navigate('/agriculture');
    else if (tab === 'rent') navigate('/rent');
  };

  const ProductSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
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

        {/* Category Filter */}
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {homeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-primary/20`
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <SectionHeader
            title="Trending Now"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  location={product.location}
                  is_negotiable={product.is_negotiable}
                  quantity={product.quantity}
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
        {allProducts.length > 8 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <SectionHeader
              title="More for You"
              icon={<ShoppingBag className="h-4 w-4 text-primary" />}
              onViewAll={() => {}}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allProducts.slice(8).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  location={product.location}
                  is_negotiable={product.is_negotiable}
                  quantity={product.quantity}
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
            Rwanda Smart Market — Buy Local, Think Smart.
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