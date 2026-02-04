import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, ArrowLeft, Check, CheckCheck, Trash2, 
  Megaphone, MessageCircle, ShoppingBag, AlertCircle,
  Shield, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean | null;
  created_at: string | null;
  user_id: string | null;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to realtime notifications
      const channel = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            // Only add if it's for this user or global
            if (newNotification.user_id === user.id || newNotification.user_id === null) {
              setNotifications(prev => [newNotification, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`user_id.eq.${user.id},user_id.is.null`);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const deleteNotification = async (id: string) => {
    // Only admin can delete notifications
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "",
        variant: "destructive"
      });
      return;
    }

    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  const getIcon = (type: string | null) => {
    switch (type) {
      case 'promotion':
        return Megaphone;
      case 'message':
        return MessageCircle;
      case 'order':
        return ShoppingBag;
      case 'alert':
        return AlertCircle;
      case 'admin':
        return Shield;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string | null) => {
    switch (type) {
      case 'promotion':
        return 'bg-purple-100 text-purple-600';
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'order':
        return 'bg-green-100 text-green-600';
      case 'alert':
        return 'bg-red-100 text-red-600';
      case 'admin':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Bell className="h-16 w-16 text-primary/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to view notifications</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            {isAdmin && (
              <Badge className="bg-primary/10 text-primary">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Admin Notice *
      {!isAdmin && (
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            Only administrators can delete notifications. You can read and mark them as read.
          </p>
        </div>
      )} */}

      {/* Notifications List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-sm">
              You'll receive updates about orders, messages, and promotions here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const Icon = getIcon(notification.type);
              return (
                <div 
                  key={notification.id}
                  className={cn(
                    "bg-white rounded-xl p-4 border shadow-sm transition-all",
                    !notification.is_read && "border-l-4 border-l-primary bg-primary/5"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      getIconColor(notification.type)
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 rounded-full hover:bg-gray-100 text-muted-foreground hover:text-primary"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {/* Only show delete button for admins */}
                          {isAdmin && (
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1.5 rounded-full hover:bg-gray-100 text-muted-foreground hover:text-destructive"
                              title="Delete (Admin only)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.created_at && format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </span>
                        {notification.type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.type}
                          </Badge>
                        )}
                        {notification.user_id === null && (
                          <Badge className="text-xs bg-purple-100 text-purple-700">
                            Global
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
