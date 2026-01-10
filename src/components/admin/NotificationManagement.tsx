import { useState, useEffect } from "react";
import { 
  Bell, Send, Users, Store, User, Plus, Trash2, MoreVertical
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
    targetGroup: 'all',
  });
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }

    setSending(true);
    
    // Get target users based on selection
    let query = supabase.from('profiles').select('id');
    
    if (formData.targetGroup === 'sellers') {
      query = query.eq('user_type', 'seller');
    } else if (formData.targetGroup === 'buyers') {
      query = query.eq('user_type', 'buyer');
    }

    const { data: users, error: usersError } = await query;

    if (usersError || !users) {
      toast({ title: "Failed to get users", variant: "destructive" });
      setSending(false);
      return;
    }

    // Create notifications for all target users
    const notificationsToInsert = users.map(user => ({
      user_id: user.id,
      title: formData.title,
      message: formData.message,
      type: 'admin',
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (error) {
      toast({ title: "Failed to send notifications", variant: "destructive" });
    } else {
      toast({ title: `Notification sent to ${users.length} users!` });
      fetchNotifications();
      setFormData({ title: '', message: '', targetGroup: 'all' });
      setShowAddDialog(false);
    }
    
    setSending(false);
  };

  const targetGroups = [
    { value: 'all', label: 'All Users', icon: Users },
    { value: 'sellers', label: 'Sellers Only', icon: Store },
    { value: 'buyers', label: 'Buyers Only', icon: User },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Send announcements to your users
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Group</label>
                <Select
                  value={formData.targetGroup}
                  onValueChange={(value) => setFormData({ ...formData, targetGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
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
              <Button 
                onClick={handleSendNotification} 
                className="w-full gap-2"
                disabled={sending}
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send to All'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {targetGroups.map(group => (
          <div key={group.value} className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <group.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{group.label}</span>
            </div>
            <p className="text-xl font-bold">-</p>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
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
              <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-600" />
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
