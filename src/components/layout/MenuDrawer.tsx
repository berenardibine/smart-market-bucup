import { X, User, Store, Heart, Trophy, Settings, Phone, LogOut, LogIn, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const menuItems = [
    { icon: User, label: "My Account", href: "/account", requiresAuth: true },
    { icon: Store, label: "My Shop", href: "/my-shop", requiresAuth: true, sellerOnly: true },
    { icon: Heart, label: "Favorites", href: "/favorites", requiresAuth: true },
    { icon: Trophy, label: "Smart Challenge", href: "/challenges", badge: "New" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Phone, label: "Contact Support", href: "/support" },
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
          "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-background shadow-elevated transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-orange">
                  <span className="text-primary-foreground font-bold text-lg">{initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile?.user_type || 'Member'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Welcome</p>
                  <p className="text-sm text-muted-foreground">Sign in to continue</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {filteredItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.href)}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-accent transition-colors tap-highlight-none"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-2xs font-semibold">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Login/Logout */}
          <div className="p-4 border-t border-border">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors tap-highlight-none group"
              >
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <span className="font-medium text-destructive">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => handleNavigate('/auth')}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity tap-highlight-none"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-white">Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-6 pt-2">
            <p className="text-center text-2xs text-muted-foreground">
              Rwanda Smart Market v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuDrawer;
