import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Search, MoreVertical, Shield, Ban, 
  ArrowLeft, RefreshCw, CheckCircle, XCircle, Trash2, Edit, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

type ActionType = 'block' | 'ban' | 'delete' | 'edit' | null;

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Action modal state
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Edit modal state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || u.user_type === filter || 
      (filter === 'blocked' && u.status === 'blocked') ||
      (filter === 'banned' && u.status === 'banned');
    return matchesSearch && matchesFilter;
  });

  const openAction = (user: any, type: ActionType) => {
    setSelectedUser(user);
    setActionType(type);
    setReason("");
    if (type === 'edit') {
      setEditName(user.full_name || "");
      setEditEmail(user.email || "");
      setEditPhone(user.phone_number || "");
      setEditWhatsapp(user.whatsapp_number || "");
      setEditLocation(user.location || "");
    }
  };

  const closeAction = () => {
    setSelectedUser(null);
    setActionType(null);
    setReason("");
    setActionLoading(false);
  };

  const handleBlockOrBan = async () => {
    if (!selectedUser || !actionType) return;
    if (!reason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    const newStatus = actionType === 'block' ? 'blocked' : 'banned';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus, blocking_reason: reason.trim() })
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: `Failed to ${actionType} user`, variant: "destructive" });
    } else {
      toast({ title: `User ${newStatus} successfully` });
      fetchUsers();
    }
    closeAction();
  };

  const handleUnblock = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active', blocking_reason: null })
      .eq('id', userId);
    if (error) {
      toast({ title: "Failed to unblock user", variant: "destructive" });
    } else {
      toast({ title: "User activated successfully" });
      fetchUsers();
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    // Delete profile (products cascade or remain orphaned based on DB config)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: "Failed to delete user", variant: "destructive" });
    } else {
      toast({ title: "User deleted successfully" });
      fetchUsers();
    }
    closeAction();
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName.trim(),
        phone_number: editPhone.trim() || null,
        whatsapp_number: editWhatsapp.trim() || null,
        location: editLocation.trim() || null,
      })
      .eq('id', selectedUser.id);

    if (error) {
      toast({ title: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: "User updated successfully" });
      fetchUsers();
    }
    closeAction();
  };

  const getStatusBadge = (status: string | null) => {
    const s = status || 'active';
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      blocked: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      banned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return <Badge className={cn("text-xs", styles[s] || styles.active)}>{s}</Badge>;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Users</h1>
            <p className="text-xs text-muted-foreground">{users.length} total</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-card rounded-xl p-3 border">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-lg font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-xl p-3 border">
            <CheckCircle className="h-4 w-4 text-green-600 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.status === 'active' || !u.status).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card rounded-xl p-3 border">
            <Ban className="h-4 w-4 text-orange-600 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.status === 'blocked').length}</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </div>
          <div className="bg-card rounded-xl p-3 border">
            <AlertTriangle className="h-4 w-4 text-red-600 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.status === 'banned').length}</p>
            <p className="text-xs text-muted-foreground">Banned</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'seller', 'buyer', 'blocked', 'banned'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* User List */}
        <div className="space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-card rounded-xl p-3 border flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {user.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.user_type}
                    </Badge>
                    {getStatusBadge(user.status)}
                    {user.identity_verified ? (
                      <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✔ Verified</Badge>
                    ) : user.user_type === 'seller' ? (
                      <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Unverified</Badge>
                    ) : null}
                  </div>
                  {user.blocking_reason && (user.status === 'blocked' || user.status === 'banned') && (
                    <p className="text-xs text-destructive mt-1 truncate">Reason: {user.blocking_reason}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card w-48">
                    <DropdownMenuItem onClick={() => openAction(user, 'edit')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === 'blocked' || user.status === 'banned' ? (
                      <DropdownMenuItem onClick={() => handleUnblock(user.id)}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Activate
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => openAction(user, 'block')}>
                          <Ban className="h-4 w-4 mr-2 text-orange-600" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAction(user, 'ban')}>
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Ban
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openAction(user, 'delete')} className="text-destructive">
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

      {/* Block / Ban Dialog */}
      <Dialog open={actionType === 'block' || actionType === 'ban'} onOpenChange={() => closeAction()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'block' ? <Ban className="h-5 w-5 text-orange-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              {actionType === 'block' ? 'Block' : 'Ban'} User
            </DialogTitle>
            <DialogDescription>
              {actionType === 'block' 
                ? 'Blocked users cannot access the platform temporarily.' 
                : 'Banned users are permanently restricted from the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {selectedUser?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedUser?.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Reason *</label>
              <Textarea
                placeholder={`Why are you ${actionType === 'block' ? 'blocking' : 'banning'} this user?`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeAction} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={handleBlockOrBan} 
              disabled={actionLoading || !reason.trim()}
              className={cn("rounded-xl", actionType === 'ban' ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700")}
            >
              {actionLoading ? "Processing..." : actionType === 'block' ? 'Block User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={actionType === 'delete'} onOpenChange={() => closeAction()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user's profile will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {selectedUser?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-sm">{selectedUser?.full_name}</p>
              <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeAction} className="rounded-xl">Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleDelete} 
              disabled={actionLoading}
              className="rounded-xl"
            >
              {actionLoading ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={actionType === 'edit'} onOpenChange={() => closeAction()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email (read-only)</label>
              <Input value={editEmail} disabled className="rounded-xl bg-muted" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">WhatsApp</label>
              <Input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeAction} className="rounded-xl">Cancel</Button>
            <Button onClick={handleEdit} disabled={actionLoading} className="rounded-xl">
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
