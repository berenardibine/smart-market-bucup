import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Store, Package, Plus, MessageSquare, Bell,
  Settings, ChevronRight, Phone,
  Menu, X, Home, Gift,
  Zap,
  Sparkles, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMyShop } from "@/hooks/useShops";
import { useMyProducts } from "@/hooks/useProducts";
import { useProductRequests } from "@/hooks/useProductRequests";
import { useToast } from "@/hooks/use-toast";
import ShopForm from "@/components/seller/ShopForm";
import ProductForm from "@/components/seller/ProductForm";
import HomeAds from "@/components/home/HomeAds";
import ProductList from "@/components/seller/ProductList";
import RequestList from "@/components/seller/RequestList";
import SellerReferralTab from "@/components/seller/SellerReferralTab";
import TwoFactorVerifyModal from "@/components/settings/TwoFactorVerifyModal";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { cn } from "@/lib/utils";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { shop, loading: shopLoading, createShop, updateShop } = useMyShop();
  const { products, loading: productsLoading, refetch: refetchProducts } = useMyProducts();
  const { requests, loading: requestsLoading, updateRequestStatus } = useProductRequests();
  const twoFactor = useTwoFactor(user?.id);
  
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [show2FAGate, setShow2FAGate] = useState(false);
  const [twoFAVerified, setTwoFAVerified] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleCreateShop = async (data: any) => {
    try {
      await createShop(data);
      toast({ title: "Shop created successfully! 🎉" });
      setShowShopForm(false);
    } catch (err: any) {
      toast({ title: "Failed to create shop", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateShop = async (data: any) => {
    try {
      await updateShop(data);
      toast({ title: "Shop updated successfully!" });
      setShowShopForm(false);
    } catch (err: any) {
      toast({ title: "Failed to update shop", description: err.message, variant: "destructive" });
    }
  };

  const handleProductSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    refetchProducts();
    toast({ title: editingProduct ? "Product updated!" : "Product created! 🎉" });
  };

  // 2FA gate: if 2FA is enabled but not verified in this session
  const needs2FA = twoFactor.enabled && !twoFactor.verified && !twoFAVerified;

  if (!profile || profile.user_type !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-3xl shadow-xl max-w-md mx-4 border">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Store className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Seller Access Only</h2>
          <p className="text-muted-foreground mb-6">You need a seller account to access this dashboard.</p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-xl px-6">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (needs2FA && !twoFactor.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <TwoFactorVerifyModal
          open={true}
          onClose={() => navigate('/')}
          onVerified={() => {
            setTwoFAVerified(true);
            twoFactor.refresh();
          }}
          userId={user!.id}
          title="Seller Dashboard Access"
          description="Enter your 2FA code to access the seller dashboard."
        />
      </div>
    );
  }

  if (showShopForm) {
    return (
      <ShopForm 
        shop={shop} 
        onSubmit={shop ? handleUpdateShop : handleCreateShop}
        onCancel={() => setShowShopForm(false)}
      />
    );
  }

  if (showProductForm || editingProduct) {
    return (
      <ProductForm 
        product={editingProduct}
        shopId={shop?.id}
        onSuccess={handleProductSuccess}
        onCancel={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  const modules = [
    { id: 'products', label: 'Products', icon: Package, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30', description: 'Manage listings' },
    { id: 'shop', label: 'My Shop', icon: Store, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-950/30', description: 'Shop settings' },
    { id: 'referrals', label: 'Referrals', icon: Gift, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/30', description: 'Earn rewards' },
    { id: 'requests', label: 'Requests', icon: MessageSquare, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30', description: `${pendingRequests.length} pending` },
  ];

  // Render module content
  const renderModule = () => {
    switch (activeModule) {
      case 'products':
        return (
          <div className="space-y-4">
            <Button 
              onClick={() => shop ? setShowProductForm(true) : toast({ title: "Create a shop first" })}
              className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-primary to-primary/80"
              disabled={!shop}
            >
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
            <ProductList 
              products={products} 
              loading={productsLoading}
              onEdit={(product) => setEditingProduct(product)}
              onRefresh={refetchProducts}
            />
          </div>
        );
      case 'shop':
        return shop ? (
          <div className="space-y-4">
            <div className="bg-card rounded-3xl overflow-hidden border shadow-sm">
              <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
              <div className="p-4 -mt-14">
                <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-lg">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-12 w-12 text-primary" />
                  )}
                </div>
                <h2 className="text-xl font-bold mt-3">{shop.name}</h2>
                {shop.description && <p className="text-muted-foreground text-sm mt-1">{shop.description}</p>}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              {shop.contact_phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{shop.contact_phone}</span>
                </div>
              )}
              {shop.whatsapp && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{shop.whatsapp}</span>
                </div>
              )}
            </div>
            <Button onClick={() => setShowShopForm(true)} className="w-full gap-2 rounded-xl h-12">
              <Settings className="h-4 w-4" /> Edit Shop Details
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border">
            <Store className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Shop Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your shop to start selling</p>
            <Button onClick={() => setShowShopForm(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Create Shop
            </Button>
          </div>
        );
      case 'referrals':
        return <SellerReferralTab />;
      case 'requests':
        return (
          <RequestList 
            requests={requests}
            loading={requestsLoading}
            onUpdateStatus={updateRequestStatus}
          />
        );
      case 'ads':
        return null;
      default:
        return null;
    }
  };

  if (activeModule) {
    const mod = modules.find(m => m.id === activeModule);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveModule(null)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="font-bold text-lg">{mod?.label}</h1>
            </div>
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Home className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="p-4">{renderModule()}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base flex items-center gap-1">
                Seller Dashboard
                <Sparkles className="h-4 w-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">{profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="rounded-xl relative">
              <Bell className="h-5 w-5" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center font-medium">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Welcome back!</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{profile.full_name}</h2>
            <p className="text-sm opacity-80">{shop ? shop.name : 'Set up your shop to start selling'}</p>
          </div>
        </div>

        {/* Create Shop CTA */}
        {!shop && !shopLoading && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shrink-0">
                <Store className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Create Your Shop</h3>
                <p className="text-muted-foreground text-sm mb-4">Set up your shop to start selling products.</p>
                <Button onClick={() => setShowShopForm(true)} className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" /> Create Shop
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{products.length}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              {pendingRequests.length > 0 && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                  {pendingRequests.length} new
                </span>
              )}
            </div>
            <p className="text-3xl font-bold">{requests.length}</p>
            <p className="text-sm text-muted-foreground">Requests</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => shop ? setShowProductForm(true) : toast({ title: "Create a shop first" })}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">Add</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2 rounded-2xl border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
              onClick={() => setActiveModule('referrals')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium">Refer</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2 rounded-2xl border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all relative"
              onClick={() => setActiveModule('requests')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium">Inbox</span>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* All Modules Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-bold">All Modules</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 hover:shadow-lg transition-all text-left group",
                  module.bg,
                  "border-transparent hover:border-current/20"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform",
                  module.color
                )}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-sm mb-0.5">{module.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        {products.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Recent Products
              </h3>
              <button 
                onClick={() => setActiveModule('products')}
                className="text-sm text-primary hover:underline font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <img 
                    src={product.images?.[0] || '/placeholder.svg'} 
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-xs text-primary font-bold">
                      {(product as any).currency_symbol || '$'}{product.price?.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {product.views || 0} views
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Ads from Admin */}
        <HomeAds />

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Market Seller</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
