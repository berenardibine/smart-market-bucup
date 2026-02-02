import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Store, Package, Plus, MessageSquare, Bell,
  Eye, Heart, Settings, ChevronRight, Phone,
  Users, DollarSign, Sparkles, Menu, X, Home,
  ShoppingBag, TrendingUp, BarChart3, Zap, Star, Link2, MousePointerClick
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMyShop } from "@/hooks/useShops";
import { useMyProducts } from "@/hooks/useProducts";
import { useProductRequests } from "@/hooks/useProductRequests";
import { useToast } from "@/hooks/use-toast";
import { useSellerViewsStats } from "@/hooks/useProductViews";
import { supabase } from "@/integrations/supabase/client";
import ShopForm from "@/components/seller/ShopForm";
import ProductForm from "@/components/seller/ProductForm";
import ProductList from "@/components/seller/ProductList";
import RequestList from "@/components/seller/RequestList";
import LinkAnalytics from "@/components/seller/LinkAnalytics";
import SellerProductAnalytics from "@/components/seller/SellerProductAnalytics";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { shop, loading: shopLoading, createShop, updateShop } = useMyShop();
  const { products, loading: productsLoading, refetch: refetchProducts } = useMyProducts();
  const { requests, loading: requestsLoading, updateRequestStatus } = useProductRequests();
  const { stats: viewsStats, loading: viewsLoading } = useSellerViewsStats(user?.id);
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [connectorsCount, setConnectorsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);

  // Fetch connectors count
  useEffect(() => {
    if (user) {
      fetchConnectorsCount();
    }
  }, [user]);

  const fetchConnectorsCount = async () => {
    if (!user) return;
    
    const { count } = await (supabase as any)
      .from('seller_connections')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);
    
    setConnectorsCount(count || 0);
  };

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

  if (!profile || profile.user_type !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-elevated max-w-md mx-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mx-auto mb-6 shadow-orange">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Seller Access Only</h2>
          <p className="text-muted-foreground mb-6">You need a seller account to access this dashboard.</p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-xl px-6">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
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

  const stats = [
    { label: 'Views', value: viewsStats.totalViews, icon: Eye, color: 'from-blue-500 to-cyan-400', bg: 'from-blue-500/10 to-cyan-500/10' },
    { label: 'Impressions', value: viewsStats.totalImpressions, icon: MousePointerClick, color: 'from-green-500 to-emerald-400', bg: 'from-green-500/10 to-emerald-500/10' },
    { label: 'Requests', value: requests.length, icon: MessageSquare, color: 'from-orange-500 to-amber-400', bg: 'from-orange-500/10 to-amber-500/10' },
    { label: 'Connectors', value: connectorsCount, icon: Users, color: 'from-purple-500 to-violet-400', bg: 'from-purple-500/10 to-violet-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 pb-20">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-orange">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-800">Seller Dashboard</h1>
                <p className="text-xs text-muted-foreground">{profile.full_name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Home className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Shop Status - Create Shop CTA */}
      {!shop && !shopLoading && (
        <div className="m-4 p-6 bg-gradient-to-br from-primary/10 via-orange-50 to-amber-50 rounded-3xl border border-primary/20 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-orange shrink-0">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 mb-1">Create Your Shop</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Set up your shop to start selling products on Smart Market.
              </p>
              <Button onClick={() => setShowShopForm(true)} className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Shop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {shop && (
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={cn(
                  "bg-gradient-to-br rounded-2xl p-4 border shadow-soft",
                  stat.bg
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full grid grid-cols-5 h-12 bg-white rounded-xl border shadow-soft p-1">
          <TabsTrigger 
            value="overview" 
            className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="shop" 
            className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Store className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Shop</span>
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Package className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Link2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="requests" 
            className="text-xs rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-lg relative"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Requests</span>
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {shop && (
            <div className="bg-white rounded-2xl p-4 border shadow-soft">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center overflow-hidden shadow-orange">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground">{shop.trading_center || 'No location set'}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowShopForm(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Monetization Card */}
          <div 
            onClick={() => navigate('/seller-monetization')}
            className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-5 border border-amber-500/20 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-800">Monetization</h3>
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-700 border-amber-200">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn from your sales activity 
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 border shadow-soft">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-800">
              <Zap className="h-4 w-4 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => shop ? setShowProductForm(true) : toast({ title: "Create a shop first" })}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-orange-50 to-amber-50 hover:from-primary/10 hover:to-amber-100 transition-all border border-primary/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-orange">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-800">Add New Product</p>
                  <p className="text-xs text-muted-foreground">List a new item for sale</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                onClick={() => setActiveTab('requests')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-800">View Requests</p>
                  <p className="text-xs text-muted-foreground">{pendingRequests.length} pending requests</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Recent Products */}
          {products.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-slate-800">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Recent Products
                </h3>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {products.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'} 
                      alt={product.title}
                      className="w-14 h-14 rounded-xl object-cover shadow-soft"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-800">{product.title}</p>
                      <p className="text-xs text-primary font-bold">
                        {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(product.price)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Eye className="h-3 w-3 mr-1" />
                      {product.views || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="mt-4">
          {shop ? (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl overflow-hidden border shadow-soft">
                <div className="h-28 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />
                <div className="p-4 -mt-14">
                  <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white flex items-center justify-center overflow-hidden shadow-elevated">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-3 text-slate-800">{shop.name}</h2>
                  {shop.description && (
                    <p className="text-muted-foreground text-sm mt-1">{shop.description}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border shadow-soft space-y-3">
                <h3 className="font-semibold text-slate-800">Contact Information</h3>
                {shop.contact_phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{shop.contact_phone}</span>
                  </div>
                )}
                {shop.whatsapp && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{shop.whatsapp}</span>
                  </div>
                )}
                {shop.trading_center && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">{shop.trading_center}</span>
                  </div>
                )}
              </div>

              {/* Connectors Info */}
              <div className="bg-gradient-to-br from-purple-500/10 via-violet-50 to-purple-50 rounded-2xl p-5 border border-purple-500/20 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">Your Connectors</h3>
                    <p className="text-sm text-muted-foreground">People following your products</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{connectorsCount}</p>
                    <p className="text-xs text-muted-foreground">followers</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowShopForm(true)} className="w-full gap-2 rounded-xl h-12">
                <Settings className="h-4 w-4" />
                Edit Shop Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border shadow-soft">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-800">No Shop Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your shop to start selling</p>
              <Button onClick={() => setShowShopForm(true)} className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Shop
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <div className="mb-4">
            <Button 
              onClick={() => shop ? setShowProductForm(true) : toast({ title: "Create a shop first" })}
              className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-primary to-orange-400 hover:opacity-90"
              disabled={!shop}
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </div>
          <ProductList 
            products={products} 
            loading={productsLoading}
            onEdit={(product) => setEditingProduct(product)}
            onRefresh={refetchProducts}
          />
        </TabsContent>

        {/* Analytics Tab - Combined Link Analytics and Product Performance */}
        <TabsContent value="analytics" className="mt-4 space-y-6">
          {/* Product Views & Impressions Analytics */}
          <SellerProductAnalytics />
          
          {/* Link Click Analytics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Link Click Analytics</h3>
            <LinkAnalytics />
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-4">
          <RequestList 
            requests={requests}
            loading={requestsLoading}
            onUpdateStatus={updateRequestStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;
