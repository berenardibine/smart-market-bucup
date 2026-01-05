import { Search, Bell, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  notificationCount?: number;
}

const Header = ({ onMenuClick, onSearchClick, notificationCount = 3 }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const initials = profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 safe-top">
      <div className="container flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-orange">
            <span className="text-primary-foreground font-bold text-sm">RS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm leading-tight">Rwanda Smart</span>
            <span className="text-primary font-semibold text-xs leading-tight">Market</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onSearchClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon-sm" 
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-2xs bg-destructive text-destructive-foreground border-2 border-background"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>
          
          {user ? (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={onMenuClick}
              className="relative overflow-hidden"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-xs">{initials}</span>
              </div>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={onMenuClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
