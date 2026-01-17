import { Search, Bell, Menu, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  notificationCount?: number;
}

const Header = ({ onMenuClick, onSearchClick, notificationCount = 0 }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const initials = profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-orange-500 safe-top shadow-orange">
      <div className="container flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight tracking-tight">Smart Market</span>
            <span className="text-orange-100 font-medium text-xs leading-tight">Buy Smart, Live Smart</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSearchClick}
            className="h-9 w-9 text-white hover:bg-white/20"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/notifications')}
                className="relative h-9 w-9 text-white hover:bg-white/20"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-primary"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onMenuClick}
                className="h-9 w-9 hover:bg-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{initials}</span>
                </div>
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => navigate('/auth')}
              className="h-8 bg-white text-primary hover:bg-orange-50 font-semibold text-xs px-3 gap-1.5 shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
