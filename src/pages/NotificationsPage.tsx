import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, ArrowLeft, Check, CheckCheck, Trash2, 
  Megaphone, MessageCircle, ShoppingBag, AlertCircle,
  Shield, ChevronDown, ChevronUp
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      const channel = supabase
        .channel('notifications-page-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const newNotification = payload.new as Notification;
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
    
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    toast({ title: "All notifications marked as read" });
  };

  const deleteNotification = async (id: string) => {
    if (!isAdmin) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }

    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Toggle expand
    if (expandedId === notification.id) {
      setExpandedId(null);
    } else {
      setExpandedId(notification.id);
      // Mark as read when opened
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
    }
  };

  const getIcon = (type: string | null) => {
    switch (type) {
      case 'promotion': return Megaphone;
      case 'message': return MessageCircle;
      case 'order': return ShoppingBag;
      case 'alert': return AlertCircle;
      case 'admin': case 'push': return Shield;
      default: return Bell;
    }
  };

  const getIconColor = (type: string | null) => {
    switch (type) {
      case 'promotion': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'message': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'order': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'admin': case 'push': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const isHtmlMessage = (msg: string) => /<[a-z][\s\S]*>/i.test(msg);

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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="gap-1.5 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Read all
              </Button>
            )}
          </div>
        </div>
      </div>

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
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = getIcon(notification.type);
              const isExpanded = expandedId === notification.id;
              return (
                <div 
                  key={notification.id}
                  className={cn(
                    "bg-card rounded-xl border shadow-sm transition-all cursor-pointer active:scale-[0.99]",
                    !notification.is_read && "border-l-4 border-l-primary"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-3.5">
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        getIconColor(notification.type)
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={cn("font-semibold text-sm", !notification.is_read && "text-foreground")}>{notification.title}</h3>
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            {!isExpanded && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {isHtmlMessage(notification.message) 
                                  ? notification.message.replace(/<[^>]*>/g, '').slice(0, 80) 
                                  : notification.message.slice(0, 80)
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground">
                            {notification.created_at && format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </span>
                          {notification.type && (
                            <Badge variant="outline" className="text-[10px] capitalize h-4 px-1.5">
                              {notification.type}
                            </Badge>
                          )}
                          {notification.user_id === null && (
                            <Badge className="text-[10px] bg-primary/10 text-primary h-4 px-1.5">
                              Global
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded full message */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        {isHtmlMessage(notification.message) ? (
                          <div 
                            className="prose prose-sm max-w-none text-foreground text-sm"
                            dangerouslySetInnerHTML={{ __html: notification.message }}
                          />
                        ) : (
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs h-7"
                              onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                            >
                              <Check className="h-3 w-3" />
                              Mark read
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-xs h-7 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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
