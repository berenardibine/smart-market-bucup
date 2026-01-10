import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, LayoutDashboard, Users, Package, Store, 
  MessageSquare, LogOut, Bell, BarChart3, Quote, Megaphone,
  RefreshCw, Shield, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

// Admin Modules
import UserManagement from "@/components/admin/UserManagement";
import ShopManagement from "@/components/admin/ShopManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import MotivationManagement from "@/components/admin/MotivationManagement";
import NotificationManagement from "@/components/admin/NotificationManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import MessagesManagement from "@/components/admin/MessagesManagement";
import AdsManagement from "@/components/admin/AdsManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeModule, setActiveModule] = useState("analytics");

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const modules = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-blue-600' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-green-600' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-orange-600' },
    { id: 'shops', label: 'Shops', icon: Store, color: 'text-purple-600' },
    { id: 'motivations', label: 'Motivations', icon: Quote, color: 'text-pink-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-cyan-600' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'text-teal-600' },
    { id: 'ads', label: 'Smart Ads', icon: Megaphone, color: 'text-amber-600' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'analytics': return <AnalyticsDashboard />;
      case 'users': return <UserManagement />;
      case 'products': return <ProductManagement />;
      case 'shops': return <ShopManagement />;
      case 'motivations': return <MotivationManagement />;
      case 'notifications': return <NotificationManagement />;
      case 'messages': return <MessagesManagement />;
      case 'ads': return <AdsManagement />;
      default: return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
              <div>
                <h1 className="font-bold text-lg flex items-center gap-2">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">Rwanda Smart Market</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toast({ title: "Data refreshed" })}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Module Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeModule === module.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <module.icon className="h-4 w-4" />
              {module.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 pb-20">
        {renderModule()}
      </main>
    </div>
  );
};

export default AdminDashboard;
