import { Home, Car, Wheat, Wrench, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: <Home className="h-5 w-5" />, href: "/", color: "from-primary to-orange-400" },
  { id: "asset", label: "Asset", icon: <Car className="h-5 w-5" />, href: "/assets", color: "from-secondary to-blue-400" },
  { id: "agriculture", label: "Agri", icon: <Wheat className="h-5 w-5" />, href: "/agriculture", color: "from-green-500 to-emerald-400" },
  { id: "rent", label: "Rent", icon: <Wrench className="h-5 w-5" />, href: "/rent", color: "from-purple-500 to-violet-400" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-bottom">
      <div className="container">
        <div className="flex items-center justify-around h-16 relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 tap-highlight-none min-w-[64px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active background */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r opacity-10",
                    item.color
                  )} />
                )}
                
                <div className={cn(
                  "relative transition-all duration-300",
                  isActive && "scale-110 -translate-y-0.5"
                )}>
                  {item.icon}
                  {isActive && (
                    <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary animate-pulse" />
                  )}
                </div>
                
                <span className={cn(
                  "text-2xs font-medium transition-all duration-200",
                  isActive && "font-bold"
                )}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r animate-scale-in",
                    item.color
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
