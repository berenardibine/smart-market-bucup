import { useState, useEffect } from "react";
import { 
  Users, Package, Store, MessageSquare, Eye,
  Trash2, Ban, CheckCircle, MoreVertical, Search, Edit, Mail, 
  Send, Phone, MapPin, Calendar, UserX, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [notificationMessage, setNotificationMessage] = useState({ title: '', message: '' });
  const [editData, setEditData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    user_type: '',
    location: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlockUser = async (withReason: boolean = false) => {
    if (!selectedUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'blocked',
        blocking_reason: withReason ? blockReason : 'Violation of terms'
      })
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: "Failed to block user", variant: "destructive" });
    } else {
      toast({ title: "User blocked successfully" });
      fetchUsers();
      setShowBlockDialog(false);
      setShowUserDetail(false);
      setBlockReason("");
    }
  };

  const handleBanUser = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'banned' })
      .eq('id', id);

    if (error) {
      toast({ title: "Failed to ban user", variant: "destructive" });
    } else {
      toast({ title: "User banned permanently" });
      fetchUsers();
    }
  };

  const handleActivateUser = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active', blocking_reason: null })
      .eq('id', id);

    if (error) {
      toast({ title: "Failed to activate user", variant: "destructive" });
    } else {
      toast({ title: "User activated successfully" });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Failed to delete user", variant: "destructive" });
    } else {
      toast({ title: "User deleted" });
      fetchUsers();
      setShowUserDetail(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update(editData)
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: "User updated successfully" });
      fetchUsers();
      setShowEditDialog(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationMessage.title || !notificationMessage.message) return;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: selectedUser.id,
        title: notificationMessage.title,
        message: notificationMessage.message,
        type: 'admin',
      });

    if (error) {
      toast({ title: "Failed to send notification", variant: "destructive" });
    } else {
      toast({ title: "Notification sent!" });
      setShowNotificationDialog(false);
      setNotificationMessage({ title: '', message: '' });
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      user_type: user.user_type || 'buyer',
      location: user.location || '',
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-white"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12"
          onClick={fetchUsers}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">{users.filter(u => u.status === 'active' || !u.status).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Store className="h-4 w-4" />
            <span className="text-xs font-medium">Sellers</span>
          </div>
          <p className="text-2xl font-bold">{users.filter(u => u.user_type === 'seller').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <UserX className="h-4 w-4" />
            <span className="text-xs font-medium">Blocked</span>
          </div>
          <p className="text-2xl font-bold">{users.filter(u => u.status === 'blocked' || u.status === 'banned').length}</p>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <h3 className="font-semibold">All Users ({filteredUsers.length})</h3>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-16" />
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.user_type}
                    </Badge>
                    <Badge 
                      className={cn(
                        "text-xs",
                        (!user.status || user.status === 'active')
                          ? "bg-green-100 text-green-700" 
                          : user.status === 'blocked'
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {user.status || 'active'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserDetail(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedUser(user);
                      setShowNotificationDialog(true);
                    }}>
                      <Send className="h-4 w-4 mr-2 text-blue-600" />
                      Send Notification
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedUser(user);
                      setShowBlockDialog(true);
                    }}>
                      <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                      Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                      <UserX className="h-4 w-4 mr-2 text-orange-600" />
                      Ban
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user.id)} 
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {selectedUser.profile_image ? (
                    <img src={selectedUser.profile_image} alt={selectedUser.full_name} className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.full_name}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={cn(
                    "mt-1",
                    (!selectedUser.status || selectedUser.status === 'active')
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    {selectedUser.status || 'active'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone className="h-3 w-3" />
                    <span className="text-xs">Phone</span>
                  </div>
                  <p className="font-medium text-sm">{selectedUser.phone_number || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Store className="h-3 w-3" />
                    <span className="text-xs">Type</span>
                  </div>
                  <p className="font-medium text-sm capitalize">{selectedUser.user_type}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">Location</span>
                  </div>
                  <p className="font-medium text-sm">{selectedUser.location || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Joined</span>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PP') : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Last Active</span>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedUser.last_active ? format(new Date(selectedUser.last_active), 'PPp') : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedUser.blocking_reason && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-600 font-medium mb-1">Block Reason:</p>
                  <p className="text-sm text-red-700">{selectedUser.blocking_reason}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button 
                  className="flex-1 gap-2" 
                  variant="outline"
                  onClick={() => openEditDialog(selectedUser)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  variant="outline"
                  onClick={() => {
                    setShowNotificationDialog(true);
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Notify
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => handleActivateUser(selectedUser.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  Activate
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowBlockDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Block
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Block User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to block <strong>{selectedUser?.full_name}</strong>. 
              They will be logged out and see the blocked page.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for blocking</label>
              <Textarea
                placeholder="Enter the reason for blocking this user..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleBlockUser(true)}>
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <Input
                value={editData.phone_number}
                onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a notification to <strong>{selectedUser?.full_name}</strong>
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Notification title..."
                value={notificationMessage.title}
                onChange={(e) => setNotificationMessage({ ...notificationMessage, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Write your message..."
                value={notificationMessage.message}
                onChange={(e) => setNotificationMessage({ ...notificationMessage, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
