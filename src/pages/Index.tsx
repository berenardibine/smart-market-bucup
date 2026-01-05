import { useState } from "react";
import { TrendingUp, Store, Wheat, Car, Wrench, ShoppingBag } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MenuDrawer from "@/components/layout/MenuDrawer";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import LocationFilter from "@/components/home/LocationFilter";
import AIGreeting from "@/components/home/AIGreeting";
import DailyMotivation from "@/components/home/DailyMotivation";
import SmartChallenge from "@/components/home/SmartChallenge";
import ProductCard from "@/components/home/ProductCard";
import ShopCard from "@/components/home/ShopCard";
import RentCard from "@/components/home/RentCard";
import SectionHeader from "@/components/home/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  trendingProducts,
  recommendedShops,
  agricultureProducts,
  assetProducts,
  rentProducts,
  generalProducts,
} from "@/data/mockData";

const Index = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const isSeller = profile?.user_type === 'seller';

  return (
    <div className="min-h-screen bg-background pb-20 pt-14">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="container px-4 py-4 space-y-6">
        {/* Location Filter */}
        <section className="animate-fade-up">
          <LocationFilter />
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

        {/* Trending Products */}
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <SectionHeader
            title="Trending Now"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {trendingProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isFavorite={favorites.includes(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </section>

        {/* Recommended Shops */}
        <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <SectionHeader
            title="Recommended Shops"
            icon={<Store className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedShops.map((shop) => (
              <ShopCard key={shop.id} {...shop} />
            ))}
          </div>
        </section>

        {/* Agriculture */}
        <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <SectionHeader
            title="Fresh from Farms"
            icon={<Wheat className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {agricultureProducts.map((product) => (
              <div key={product.id} className="w-40 shrink-0">
                <ProductCard
                  {...product}
                  isFavorite={favorites.includes(product.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Assets */}
        <section className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <SectionHeader
            title="Assets & Properties"
            icon={<Car className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {assetProducts.map((product) => (
              <div key={product.id} className="w-44 shrink-0">
                <ProductCard
                  {...product}
                  isFavorite={favorites.includes(product.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Rent */}
        <section className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <SectionHeader
            title="Equipment for Rent"
            icon={<Wrench className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rentProducts.slice(0, 4).map((item) => (
              <RentCard
                key={item.id}
                {...item}
                isFavorite={favorites.includes(item.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </section>

        {/* General Products */}
        <section className="animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <SectionHeader
            title="More for You"
            icon={<ShoppingBag className="h-4 w-4 text-primary" />}
            onViewAll={() => {}}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {generalProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isFavorite={favorites.includes(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </section>

        {/* Tagline Footer */}
        <section className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            🛍️ Your Market. Your Area. Your Power.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Rwanda Smart Market — Buy Local, Think Smart.
          </p>
        </section>
      </main>

      {/* Seller Floating Action Button */}
      {isSeller && <SellerFAB />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Index;
