import { X, User, Store, Heart, Trophy, Settings, Phone, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: User, label: "My Account", href: "/account" },
  { icon: Store, label: "My Shop", href: "/my-shop" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: Trophy, label: "Smart Challenge", href: "/challenges", badge: "New" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Phone, label: "Contact Support", href: "/support" },
];

const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-orange">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Berenard</p>
                <p className="text-sm text-muted-foreground">Kivu Sector</p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
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

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors tap-highlight-none group">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Logout</span>
            </button>
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
