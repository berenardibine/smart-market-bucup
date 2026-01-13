import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, LayoutDashboard, Users, Package, Store, 
  MessageSquare, LogOut, Bell, BarChart3, Quote, Megaphone,
  RefreshCw, Shield, FolderTree, MapPin, Menu, X,
  ChevronLeft, ChevronRight, Home, Settings, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, profile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeModule, setActiveModule] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-orange">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-elevated border border-red-100">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-800">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-xl px-6">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const modules = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-blue-500 to-cyan-400' },
    { id: 'users', label: 'Users', icon: Users, color: 'from-emerald-500 to-green-400' },
    { id: 'products', label: 'Products', icon: Package, color: 'from-orange-500 to-amber-400' },
    { id: 'shops', label: 'Shops', icon: Store, color: 'from-purple-500 to-violet-400' },
    { id: 'categories', label: 'Categories', icon: FolderTree, color: 'from-indigo-500 to-blue-400' },
    { id: 'locations', label: 'Locations', icon: MapPin, color: 'from-rose-500 to-pink-400' },
    { id: 'motivations', label: 'Motivations', icon: Quote, color: 'from-pink-500 to-rose-400' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-cyan-500 to-teal-400' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-teal-500 to-emerald-400' },
    { id: 'ads', label: 'Smart Ads', icon: Megaphone, color: 'from-amber-500 to-yellow-400' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'analytics': return <AnalyticsDashboard />;
      case 'users': return <UserManagement />;
      case 'products': return <ProductManagement />;
      case 'shops': return <ShopManagement />;
      case 'categories': return <CategoriesManagement />;
      case 'locations': return <LocationManagement />;
      case 'motivations': return <MotivationManagement />;
      case 'notifications': return <NotificationManagement />;
      case 'messages': return <MessagesManagement />;
      case 'ads': return <AdsManagement />;
      default: return <AnalyticsDashboard />;
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const activeModuleData = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-soft z-40 transition-all duration-300 hidden lg:flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-orange">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-slate-800">Smart Market</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((module) => {
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-white/20" 
                    : `bg-gradient-to-br ${module.color} text-white group-hover:scale-110`
                )}>
                  <module.icon className="h-4 w-4" />
                </div>
                {sidebarOpen && (
                  <span className="font-medium text-sm">{module.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Actions */}
        <div className="p-3 border-t space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-semibold">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size={sidebarOpen ? "default" : "icon"}
              className="flex-1 justify-start gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              {sidebarOpen && "Home"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => { signOut(); navigate('/'); }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

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
          "fixed left-0 top-0 h-full w-72 bg-white border-r shadow-elevated z-50 transition-transform duration-300 lg:hidden flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-orange">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">Smart Market</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((module) => {
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                  isActive
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isActive ? "bg-white/20" : `bg-gradient-to-br ${module.color} text-white`
                )}>
                  <module.icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">{module.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-semibold">
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

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                {activeModuleData && (
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    activeModuleData.color
                  )}>
                    <activeModuleData.icon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{activeModuleData?.label || 'Dashboard'}</h2>
                  <p className="text-xs text-muted-foreground hidden sm:block">Manage your platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl"
                onClick={() => toast({ title: "Data refreshed" })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl lg:hidden"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 pb-20">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
