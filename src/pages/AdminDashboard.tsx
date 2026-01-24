import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, Store, 
  Bell, BarChart3, Quote, Megaphone,
  Shield, FolderTree, MapPin, Menu, X,
  Home, Eye, LogOut, ChevronRight, TrendingUp, Activity,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
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
          <p className="text-muted-foreground">Verifying access...</p>
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
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-xl">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const modules = [
    { id: 'products', label: 'Products', icon: Package, color: 'bg-orange-100 text-orange-600', path: '/admin/products' },
    { id: 'users', label: 'Users', icon: Users, color: 'bg-blue-100 text-blue-600', path: '/admin/users' },
    { id: 'shops', label: 'Shops', icon: Store, color: 'bg-purple-100 text-purple-600', path: '/admin/shops' },
    { id: 'categories', label: 'Categories', icon: FolderTree, color: 'bg-indigo-100 text-indigo-600', path: '/admin/categories' },
    { id: 'locations', label: 'Locations', icon: MapPin, color: 'bg-rose-100 text-rose-600', path: '/admin/locations' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-cyan-100 text-cyan-600', path: '/admin/analytics' },
    { id: 'link-analytics', label: 'Link Analytics', icon: TrendingUp, color: 'bg-teal-100 text-teal-600', path: '/admin/link-analytics' },
    { id: 'filter-analytics', label: 'Filter Analytics', icon: Activity, color: 'bg-emerald-100 text-emerald-600', path: '/admin/filter-analytics' },
    { id: 'motivations', label: 'Motivations', icon: Quote, color: 'bg-pink-100 text-pink-600', path: '/admin/motivations' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-yellow-100 text-yellow-600', path: '/admin/notifications' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'bg-green-100 text-green-600', path: '/admin/messages' },
    { id: 'ads', label: 'Smart Ads', icon: Megaphone, color: 'bg-amber-100 text-amber-600', path: '/admin/ads' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Smart Market</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-72 bg-card border-l z-50 transition-transform duration-300",
        menuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(module.path);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all text-left"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", module.color)}>
                  <module.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{module.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full gap-2 text-destructive hover:bg-destructive/10"
              onClick={() => { signOut(); navigate('/'); }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/admin/users')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>

          <div 
            className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/admin/products')}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>

          <div 
            className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/admin/analytics')}
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>

          <div 
            className="bg-card rounded-2xl p-4 border cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/admin/shops')}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{stats.activeShops.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Active Shops</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-3 flex-col gap-2 rounded-xl"
              onClick={() => navigate('/admin/products/add')}
            >
              <Package className="h-5 w-5 text-primary" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-3 flex-col gap-2 rounded-xl"
              onClick={() => navigate('/admin/notifications')}
            >
              <Bell className="h-5 w-5 text-primary" />
              <span className="text-xs">Notify</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-3 flex-col gap-2 rounded-xl"
              onClick={() => navigate('/admin/ads')}
            >
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="text-xs">Create Ad</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-3 flex-col gap-2 rounded-xl"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </div>

        {/* All Modules */}
        <div>
          <h2 className="font-semibold mb-3">All Modules</h2>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
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
    </div>
  );
};

export default AdminDashboard;
