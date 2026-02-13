import { useState, useEffect } from "react";
import { 
  Bell, Send, Users, Store, User, Globe, Plus, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  created_at: string | null;
}

const NotificationManagement = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetGroup: 'all_push',
    url: '/',
    imageUrl: '',
  });
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ tokens: 0, subscriptions: 0, users: 0 });

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setNotifications(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [tokensRes, subsRes, usersRes] = await Promise.all([
      supabase.from('notification_tokens' as any).select('id', { count: 'exact', head: true }),
      supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      tokens: tokensRes.count || 0,
      subscriptions: subsRes.count || 0,
      users: usersRes.count || 0,
    });
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const handleSendPushNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      // Send push notification via edge function
      const pushPayload: any = {
        title: formData.title,
        body: formData.message,
        url: formData.url || '/',
        type: 'admin',
      };

      if (formData.targetGroup === 'all_push') {
        // Send to ALL push subscribers (including guests)
        pushPayload.broadcast = true;
      } else if (formData.targetGroup === 'sellers') {
        // Get seller IDs and send individually
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_type', 'seller');
        
        if (sellers) {
          for (const seller of sellers) {
            await supabase.functions.invoke('send-push', {
              body: { ...pushPayload, userId: seller.id, broadcast: false },
            });
          }
        }
        
        toast({ title: `Push sent to ${sellers?.length || 0} sellers!` });
        fetchNotifications();
        setFormData({ title: '', message: '', targetGroup: 'all_push', url: '/', imageUrl: '' });
        setShowAddDialog(false);
        setSending(false);
        return;
      } else if (formData.targetGroup === 'buyers') {
        const { data: buyers } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_type', 'buyer');
        
        if (buyers) {
          for (const buyer of buyers) {
            await supabase.functions.invoke('send-push', {
              body: { ...pushPayload, userId: buyer.id, broadcast: false },
            });
          }
        }

        toast({ title: `Push sent to ${buyers?.length || 0} buyers!` });
        fetchNotifications();
        setFormData({ title: '', message: '', targetGroup: 'all_push', url: '/', imageUrl: '' });
        setShowAddDialog(false);
        setSending(false);
        return;
      }

      // Broadcast to all
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: pushPayload,
      });

      if (error) {
        toast({ title: "Failed to send push", description: error.message, variant: "destructive" });
      } else {
        toast({ 
          title: `Push notification sent!`,
          description: `Delivered: ${result?.sent || 0}, Failed: ${result?.failed || 0}`,
        });
        fetchNotifications();
        fetchStats();
        setFormData({ title: '', message: '', targetGroup: 'all_push', url: '/', imageUrl: '' });
        setShowAddDialog(false);
      }
    } catch (err: any) {
      toast({ title: "Error sending notification", description: err.message, variant: "destructive" });
    }
    
    setSending(false);
  };

  const targetGroups = [
    { value: 'all_push', label: 'All Devices (incl. guests)', icon: Globe },
    { value: 'sellers', label: 'Sellers Only', icon: Store },
    { value: 'buyers', label: 'Buyers Only', icon: User },
  ];

  const statCards = [
    { label: 'FCM Tokens', value: stats.tokens, icon: Bell, color: 'text-blue-600' },
    { label: 'Push Subs', value: stats.subscriptions, icon: Globe, color: 'text-green-600' },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Send push notifications to all users & guests
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
              Send Push
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Send Push Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target</label>
                <Select
                  value={formData.targetGroup}
                  onValueChange={(value) => setFormData({ ...formData, targetGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {targetGroups.map(group => (
                      <SelectItem key={group.value} value={group.value}>
                        <span className="flex items-center gap-2">
                          <group.icon className="h-4 w-4" />
                          {group.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Notification title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message *</label>
                <Textarea
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Link URL (optional)</label>
                <Input
                  placeholder="e.g. /products or https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSendPushNotification} 
                className="w-full gap-2"
                disabled={sending}
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send Push Notification'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="bg-card rounded-xl p-4 border">
            <div className={`flex items-center gap-2 ${card.color} mb-1`}>
              <card.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{card.label}</span>
            </div>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Notifications</h3>
        </div>
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-16" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            notifications.slice(0, 20).map(notification => (
              <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.created_at && format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
