import { useState } from "react";
import { TrendingUp, Store, Wheat, Car, Wrench, ShoppingBag, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MenuDrawer from "@/components/layout/MenuDrawer";
import SearchModal from "@/components/layout/SearchModal";
import SellerFAB from "@/components/layout/SellerFAB";
import LocationFilter from "@/components/home/LocationFilter";
import AIGreeting from "@/components/home/AIGreeting";
import DailyMotivation from "@/components/home/DailyMotivation";
import SmartChallenge from "@/components/home/SmartChallenge";
import ProductCard from "@/components/products/ProductCard";
import ShopCard from "@/components/home/ShopCard";
import RentCard from "@/components/home/RentCard";
import SectionHeader from "@/components/home/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  recommendedShops,
  rentProducts,
} from "@/data/mockData";

const Index = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { products: assetProducts, loading: assetsLoading } = useProducts('asset');
  const { products: agricultureProducts, loading: agriLoading } = useProducts('agriculture');

  const isSeller = profile?.user_type === 'seller';

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
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allProducts.slice(0, 6).map((product) => (
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
            {agriLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="w-40 shrink-0">
                  <ProductSkeleton />
                </div>
              ))
            ) : agricultureProducts.length > 0 ? (
              agricultureProducts.map((product) => (
                <div key={product.id} className="w-40 shrink-0">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    images={product.images}
                    location={product.location}
                    is_negotiable={product.is_negotiable}
                    compact
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-muted-foreground">
                No agriculture products yet
              </div>
            )}
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
            {assetsLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="w-44 shrink-0">
                  <ProductSkeleton />
                </div>
              ))
            ) : assetProducts.length > 0 ? (
              assetProducts.map((product) => (
                <div key={product.id} className="w-44 shrink-0">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    images={product.images}
                    location={product.location}
                    is_negotiable={product.is_negotiable}
                    compact
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-muted-foreground">
                No asset products yet
              </div>
            )}
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
                isFavorite={false}
                onFavoriteToggle={() => {}}
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
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
            </div>
          ) : allProducts.length > 6 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allProducts.slice(6).map((product) => (
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
            <div className="text-center py-8 text-muted-foreground">
              More products coming soon!
            </div>
          )}
        </section>

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

      {/* Seller Floating Action Button */}
      {isSeller && <SellerFAB />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Index;
