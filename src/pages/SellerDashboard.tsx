import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Store, Package, Plus, MessageSquare, Bell,
  Eye, Heart, ShoppingBag, Settings, ChevronRight, Phone,
  CheckCircle, Clock, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMyShop } from "@/hooks/useShops";
import { useMyProducts } from "@/hooks/useProducts";
import { useProductRequests } from "@/hooks/useProductRequests";
import { useToast } from "@/hooks/use-toast";
import ShopForm from "@/components/seller/ShopForm";
import ProductForm from "@/components/seller/ProductForm";
import ProductList from "@/components/seller/ProductList";
import RequestList from "@/components/seller/RequestList";
import { cn } from "@/lib/utils";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { shop, loading: shopLoading, createShop, updateShop } = useMyShop();
  const { products, loading: productsLoading, refetch: refetchProducts } = useMyProducts();
  const { requests, loading: requestsLoading, updateRequestStatus } = useProductRequests();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Seller Access Only</h2>
          <p className="text-muted-foreground mb-4">You need a seller account to access this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary to-secondary">
        <div className="flex items-center gap-3 p-4 text-white">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Seller Dashboard</h1>
            <p className="text-white/80 text-sm">{profile.full_name}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative hover:bg-white/30 transition-colors">
            <Bell className="h-5 w-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Shop Status */}
      {!shop && !shopLoading && (
        <div className="m-4 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
          <Store className="h-12 w-12 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Create Your Shop</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Set up your shop to start selling products on Rwanda Smart Market.
          </p>
          <Button onClick={() => setShowShopForm(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Create Shop
          </Button>
        </div>
      )}

      {/* Stats Overview */}
      {shop && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-4 text-center border border-blue-500/20">
              <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalViews}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-4 text-center border border-red-500/20">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalLikes}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-4 text-center border border-green-500/20">
              <MessageSquare className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="shop" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Shop
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
            Products
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white relative">
            Requests
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
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground">{shop.trading_center || 'No location set'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowShopForm(true)}>
                  Edit
                </Button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl p-4 border">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => shop ? setShowProductForm(true) : toast({ title: "Create a shop first" })}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Add New Product</p>
                  <p className="text-xs text-muted-foreground">List a new item for sale</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button 
                onClick={() => setActiveTab('requests')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">View Requests</p>
                  <p className="text-xs text-muted-foreground">{pendingRequests.length} pending requests</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Recent Products */}
          {products.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent Products</h3>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {products.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'} 
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <p className="text-xs text-primary font-semibold">
                        {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(product.price)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {product.views || 0} views
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
              <div className="bg-card rounded-2xl overflow-hidden border">
                <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-4 -mt-12">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-background flex items-center justify-center overflow-hidden shadow-lg">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-3">{shop.name}</h2>
                  {shop.description && (
                    <p className="text-muted-foreground text-sm mt-1">{shop.description}</p>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-4 border space-y-3">
                <h3 className="font-semibold">Contact Information</h3>
                {shop.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{shop.contact_phone}</span>
                  </div>
                )}
                {shop.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <span>{shop.whatsapp}</span>
                  </div>
                )}
                {shop.trading_center && (
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <span>{shop.trading_center}</span>
                  </div>
                )}
              </div>

              <Button onClick={() => setShowShopForm(true)} className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Edit Shop Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Shop Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your shop to start selling</p>
              <Button onClick={() => setShowShopForm(true)} className="gap-2">
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
              className="w-full gap-2"
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
