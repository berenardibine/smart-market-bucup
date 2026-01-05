import { Home, Car, Wheat, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: <Home className="h-5 w-5" />, href: "/" },
  { id: "asset", label: "Asset", icon: <Car className="h-5 w-5" />, href: "/assets" },
  { id: "agriculture", label: "Agri", icon: <Wheat className="h-5 w-5" />, href: "/agriculture" },
  { id: "rent", label: "Rent", icon: <Wrench className="h-5 w-5" />, href: "/rent" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-bottom">
      <div className="container">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 tap-highlight-none min-w-[64px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "relative transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                  )}
                </div>
                <span className={cn(
                  "text-2xs font-medium transition-all duration-200",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
