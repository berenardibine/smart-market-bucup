import { useState } from "react";
import { 
  Users, Package, Store, MessageSquare, TrendingUp, Eye,
  Trash2, Ban, CheckCircle, MoreVertical, Search, Edit, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const UserManagement = () => {
  const { users, loading, updateUserStatus, refetch } = useAdminUsers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlockUser = async (id: string, reason: string = "Violation of terms") => {
    const { error } = await updateUserStatus(id, 'blocked');
    if (error) {
      toast({ title: "Failed to block user", variant: "destructive" });
    } else {
      toast({ title: "User blocked successfully" });
      refetch();
    }
  };

  const handleBanUser = async (id: string) => {
    const { error } = await updateUserStatus(id, 'banned');
    if (error) {
      toast({ title: "Failed to ban user", variant: "destructive" });
    } else {
      toast({ title: "User banned successfully" });
      refetch();
    }
  };

  const handleActivateUser = async (id: string) => {
    const { error } = await updateUserStatus(id, 'active');
    if (error) {
      toast({ title: "Failed to activate user", variant: "destructive" });
    } else {
      toast({ title: "User activated successfully" });
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
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
          <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Store className="h-4 w-4" />
            <span className="text-xs font-medium">Sellers</span>
          </div>
          <p className="text-2xl font-bold">{users.filter(u => u.user_type === 'seller').length}</p>
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-semibold">
                  {user.full_name?.charAt(0) || 'U'}
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
                        user.status === 'active' 
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
                  See More
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBlockUser(user.id)}>
                      <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                      Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBanUser(user.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Ban User
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
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.full_name}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone_number || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedUser.user_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedUser.location || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedUser.status || 'active'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2" variant="outline">
                  <Mail className="h-4 w-4" />
                  Send Notification
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleBlockUser(selectedUser.id);
                    setShowUserDetail(false);
                  }}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
