import { useState } from 'react';
import { Wrench, PartyPopper, HardHat, Tractor, Truck, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import MenuDrawer from '@/components/layout/MenuDrawer';
import SearchModal from '@/components/layout/SearchModal';
import SellerFAB from '@/components/layout/SellerFAB';
import AdminFAB from '@/components/layout/AdminFAB';
import ProductCard from '@/components/products/ProductCard';
import SmartLocationHeader from '@/components/location/SmartLocationHeader';
import LocationLevelFilter from '@/components/location/LocationLevelFilter';
import LocationModal from '@/components/location/LocationModal';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useUserLocation } from '@/hooks/useUserLocation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const subcategories = [
  { id: 'all', label: 'All Rentals', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'event-equipment', label: 'Event', icon: <PartyPopper className="h-4 w-4" /> },
  { id: 'construction-equipment', label: 'Construction', icon: <HardHat className="h-4 w-4" /> },
  { id: 'farming-equipment', label: 'Farming', icon: <Tractor className="h-4 w-4" /> },
  { id: 'logistics', label: 'Logistics', icon: <Truck className="h-4 w-4" /> },
];

const RentPage = () => {
  const { profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState('all');
  
  const { 
    level, setLevel, 
    showLocationModal, setShowLocationModal, 
    saveUserLocation, getLocationLabel 
  } = useUserLocation();
  
  const { products, loading } = useProducts('rent');
  
  const isSeller = profile?.user_type === 'seller';

  // Filter by subcategory
  const filteredProducts = selectedSub === 'all' 
    ? products 
    : products.filter(p => p.category === selectedSub);

  const ProductSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-500/5 pb-20 pt-14">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="container px-4 py-4 space-y-4">
        {/* Location Header */}
        <SmartLocationHeader 
          locationLabel={getLocationLabel()} 
          onChangeLocation={() => setShowLocationModal(true)} 
        />

        {/* Level Filter */}
        <LocationLevelFilter level={level} onLevelChange={setLevel} />

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Equipment for Rent</h1>
            <p className="text-sm text-muted-foreground">Rent Tools & Equipment</p>
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSub(sub.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                selectedSub === sub.id
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {sub.icon}
              {sub.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
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
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Wrench className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Rental Equipment Yet</h3>
            <p className="text-muted-foreground">
              Be the first to list rental equipment in your area!
            </p>
          </div>
        )}
      </main>

      {isSeller && <SellerFAB />}
      <AdminFAB />
      <BottomNav activeTab="rent" onTabChange={() => {}} />
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

export default RentPage;