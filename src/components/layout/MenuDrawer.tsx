import { 
  X, User, Store, Heart, Trophy, Settings, Phone, LogOut, LogIn, 
  ChevronRight, Shield, Bell, HelpCircle, Star, Gift 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const menuItems: Array<{
    icon: typeof User;
    label: string;
    href: string;
    requiresAuth?: boolean;
    sellerOnly?: boolean;
    color: string;
    badge?: string;
  }> = [
    { icon: User, label: "My Account", href: "/account", requiresAuth: true, color: "bg-blue-500" },
    { icon: Store, label: "My Shop", href: "/my-shop", requiresAuth: true, sellerOnly: true, color: "bg-green-500" },
    { icon: Bell, label: "Notifications", href: "/notifications", requiresAuth: true, color: "bg-purple-500" },
  ];
  const supportItems = [
    { icon: Settings, label: "Settings", href: "/settings", color: "bg-slate-500" },
    { icon: HelpCircle, label: "Help Center", href: "/help", color: "bg-cyan-500" },
    { icon: Phone, label: "Contact Support", href: "/support", color: "bg-teal-500" },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.sellerOnly && profile?.user_type !== 'seller') return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });

  const handleLogout = async () => {
    await signOut();
    onClose();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleNavigate = (href: string) => {
    onClose();
    navigate(href);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out rounded-l-3xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary via-orange-500 to-amber-500 pt-6 pb-8 px-5 rounded-bl-3xl">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {user ? (
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30">
                  {profile?.profile_image ? (
                    <img src={profile.profile_image} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-lg">{displayName}</p>
                  <p className="text-white/80 text-sm capitalize">{profile?.user_type || 'Member'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                    <span className="text-white/90 text-xs font-medium">Premium Member</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Welcome!</p>
                  <p className="text-white/80 text-sm">Sign in to explore more</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Button */}
          {isAdmin && (
            <div className="px-4 -mt-4 mb-2">
              <button
                onClick={() => handleNavigate('/admin')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="flex-1 text-left font-semibold text-white">Admin Dashboard</span>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">Menu</p>
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-2xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <div className="h-px bg-border my-4" />
            
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">Support</p>
            <div className="space-y-1">
              {supportItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Login/Logout */}
          <div className="p-4 border-t border-border">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-red-600">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => handleNavigate('/auth')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 transition-opacity shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-white">Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-6 pt-2">
            <p className="text-center text-2xs text-muted-foreground">
              Smart Market • Developed by Smart Technology
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuDrawer;
