import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Package, Store, 
  MessageSquare, LogOut, Bell, BarChart3, Quote, Megaphone,
  Shield, FolderTree, MapPin, Menu, X,
  Home, TrendingUp, Eye, ShoppingCart, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

// Admin Modules
import UserManagement from "@/components/admin/UserManagement";
import ShopManagement from "@/components/admin/ShopManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import MotivationManagement from "@/components/admin/MotivationManagement";
import NotificationManagement from "@/components/admin/NotificationManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import MessagesManagement from "@/components/admin/MessagesManagement";
import AdsManagement from "@/components/admin/AdsManagement";
import CategoriesManagement from "@/components/admin/CategoriesManagement";
import LocationManagement from "@/components/admin/LocationManagement";
import LinkAnalyticsDashboard from "@/components/admin/LinkAnalyticsDashboard";
import FilterAnalyticsDashboard from "@/components/admin/FilterAnalyticsDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, profile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeModule, setActiveModule] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalViews: 0,
    activeShops: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, productsRes, shopsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, views', { count: 'exact' }),
        supabase.from('shops').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalViews,
        activeShops: shopsRes.count || 0,
      });
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-card rounded-2xl p-8 border">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-xl">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const modules = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'link-analytics', label: 'Link Analytics', icon: TrendingUp },
    { id: 'filter-analytics', label: 'Filter Analytics', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'motivations', label: 'Motivations', icon: Quote },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ads', label: 'Smart Ads', icon: Megaphone },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return <OverviewDashboard stats={stats} onNavigate={setActiveModule} />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'link-analytics': return <LinkAnalyticsDashboard />;
      case 'filter-analytics': return <FilterAnalyticsDashboard />;
      case 'users': return <UserManagement />;
      case 'products': return <ProductManagement />;
      case 'shops': return <ShopManagement />;
      case 'categories': return <CategoriesManagement />;
      case 'locations': return <LocationManagement />;
      case 'motivations': return <MotivationManagement />;
      case 'notifications': return <NotificationManagement />;
      case 'messages': return <MessagesManagement />;
      case 'ads': return <AdsManagement />;
      default: return <OverviewDashboard stats={stats} onNavigate={setActiveModule} />;
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-card border-b lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-card border-r z-50 transition-transform duration-300 lg:hidden flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">Smart Market</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleChange(module.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                activeModule === module.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <module.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{module.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-xl mb-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => { signOut(); navigate('/'); }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold">Smart Market</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  activeModule === module.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <module.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{module.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 justify-start gap-2"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => { signOut(); navigate('/'); }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="p-6 pb-20">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <main className="lg:hidden p-4 pb-20">
        {renderModule()}
      </main>
    </div>
  );
};

// Overview Dashboard Component
const OverviewDashboard = ({ stats, onNavigate }: { stats: any; onNavigate: (id: string) => void }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
          onClick={() => onNavigate('users')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>

        <div 
          className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
          onClick={() => onNavigate('products')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Products</p>
        </div>

        <div 
          className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
          onClick={() => onNavigate('analytics')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Views</p>
        </div>

        <div 
          className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
          onClick={() => onNavigate('shops')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.activeShops.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Active Shops</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-4 border">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-xl"
            onClick={() => onNavigate('products')}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Add Product</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-xl"
            onClick={() => onNavigate('notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Send Notification</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-xl"
            onClick={() => onNavigate('ads')}
          >
            <Megaphone className="h-5 w-5" />
            <span className="text-xs">Create Ad</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-xl"
            onClick={() => onNavigate('analytics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">View Analytics</span>
          </Button>
        </div>
      </div>

      {/* Module Grid */}
      <div>
        <h3 className="font-semibold mb-4">All Modules</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'users', label: 'Users', icon: Users, color: 'bg-blue-100 text-blue-600' },
            { id: 'products', label: 'Products', icon: Package, color: 'bg-orange-100 text-orange-600' },
            { id: 'shops', label: 'Shops', icon: Store, color: 'bg-purple-100 text-purple-600' },
            { id: 'categories', label: 'Categories', icon: FolderTree, color: 'bg-indigo-100 text-indigo-600' },
            { id: 'locations', label: 'Locations', icon: MapPin, color: 'bg-rose-100 text-rose-600' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-cyan-100 text-cyan-600' },
            { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-yellow-100 text-yellow-600' },
            { id: 'ads', label: 'Smart Ads', icon: Megaphone, color: 'bg-amber-100 text-amber-600' },
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => onNavigate(module.id)}
              className="bg-card p-4 rounded-xl border hover:border-primary transition-all text-left"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", module.color)}>
                <module.icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">{module.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
