import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, LayoutDashboard, Users, Package, Store, 
  MessageSquare, Settings, LogOut, TrendingUp, Eye,
  ShoppingBag, UserCheck, AlertCircle, ChevronRight,
  Trash2, Ban, CheckCircle, MoreVertical, Search,
  RefreshCw, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin, useAdminStats, useAdminProducts, useAdminUsers, useAdminShops } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { products, loading: productsLoading, deleteProduct, updateProductStatus, refetch: refetchProducts } = useAdminProducts();
  const { users, loading: usersLoading, updateUserStatus, refetch: refetchUsers } = useAdminUsers();
  const { shops, loading: shopsLoading, deleteShop, refetch: refetchShops } = useAdminShops();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard. 
            This area is restricted to administrators only.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await deleteProduct(id);
    if (error) {
      toast({ title: "Failed to delete product", variant: "destructive" });
    } else {
      toast({ title: "Product deleted successfully" });
      refetchStats();
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;
    const { error } = await deleteShop(id);
    if (error) {
      toast({ title: "Failed to delete shop", variant: "destructive" });
    } else {
      toast({ title: "Shop deleted successfully" });
      refetchStats();
    }
  };

  const handleSuspendUser = async (id: string) => {
    const { error } = await updateUserStatus(id, 'suspended');
    if (error) {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    } else {
      toast({ title: "User suspended" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = shops.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div className="bg-card rounded-2xl p-5 border shadow-soft hover:shadow-card transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("icon-wrapper", color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mt-4">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Rwanda Smart Market</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={() => {
                refetchStats();
                refetchProducts();
                refetchUsers();
                refetchShops();
                toast({ title: "Data refreshed" });
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard 
                icon={Users} 
                label="Total Users" 
                value={stats.totalUsers}
                color="icon-wrapper-blue"
                trend="+12%"
              />
              <StatCard 
                icon={Package} 
                label="Products" 
                value={stats.totalProducts}
                color="icon-wrapper-orange"
                trend="+8%"
              />
              <StatCard 
                icon={Store} 
                label="Active Shops" 
                value={stats.totalShops}
                color="icon-wrapper-purple"
              />
              <StatCard 
                icon={MessageSquare} 
                label="Requests" 
                value={stats.totalRequests}
                color="icon-wrapper-green"
              />
            </>
          )}
        </section>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, users, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2 hidden sm:block" />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2 hidden sm:block" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="shops" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Store className="h-4 w-4 mr-2 hidden sm:block" />
              Shops
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl p-5 border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Pending Actions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-warning/5 rounded-xl">
                    <span className="text-sm">Pending Requests</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {stats.pendingRequests}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Recent Activity
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• {products.length} products listed</p>
                  <p>• {shops.length} shops active</p>
                  <p>• {users.filter(u => u.user_type === 'seller').length} sellers registered</p>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-card rounded-2xl p-5 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Products</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('products')}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {products.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {product.seller?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold">All Products ({filteredProducts.length})</h3>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {productsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-16" />
                    </div>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.seller?.full_name} • {product.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {product.views || 0}
                          </Badge>
                          <Badge 
                            className={cn(
                              "text-xs",
                              product.status === 'active' 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-yellow-500/10 text-yellow-600"
                            )}
                          >
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/product/${product.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold">All Users ({filteredUsers.length})</h3>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {usersLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-16" />
                    </div>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={cn(
                              "text-xs",
                              user.user_type === 'seller' 
                                ? "bg-primary/10 text-primary" 
                                : "bg-secondary/10 text-secondary"
                            )}
                          >
                            {user.user_type}
                          </Badge>
                          {user.status === 'suspended' && (
                            <Badge className="text-xs bg-destructive/10 text-destructive">
                              Suspended
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'active')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops" className="mt-6">
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold">All Shops ({filteredShops.length})</h3>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {shopsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-16" />
                    </div>
                  ))
                ) : filteredShops.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No shops found
                  </div>
                ) : (
                  filteredShops.map(shop => (
                    <div key={shop.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className="w-14 h-14 rounded-xl bg-gradient-secondary flex items-center justify-center overflow-hidden">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{shop.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {shop.owner?.full_name || 'Unknown owner'}
                        </p>
                        {shop.trading_center && (
                          <p className="text-xs text-muted-foreground">{shop.trading_center}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeleteShop(shop.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Shop
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
