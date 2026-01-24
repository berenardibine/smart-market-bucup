import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Search, MoreVertical, Shield, Ban, 
  ArrowLeft, RefreshCw, CheckCircle, XCircle
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

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
      (filter === 'blocked' && u.status === 'blocked');
    return matchesSearch && matchesFilter;
  });

  const handleBlockUser = async (userId: string, block: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: block ? 'blocked' : 'active' })
      .eq('id', userId);
    
    if (error) {
      toast({ title: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: block ? "User blocked" : "User unblocked" });
      fetchUsers();
    }
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
            <p className="text-lg font-bold">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card rounded-xl p-3 border">
            <Shield className="h-4 w-4 text-blue-600 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.user_type === 'seller').length}</p>
            <p className="text-xs text-muted-foreground">Sellers</p>
          </div>
          <div className="bg-card rounded-xl p-3 border">
            <Ban className="h-4 w-4 text-red-600 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.status === 'blocked').length}</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'buyer', 'seller', 'blocked'].map(f => (
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
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {user.user_type}
                    </Badge>
                    <Badge 
                      className={cn(
                        "text-xs",
                        user.status === 'active' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {user.status || 'active'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card">
                    {user.status === 'blocked' ? (
                      <DropdownMenuItem onClick={() => handleBlockUser(user.id, false)}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Unblock
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => handleBlockUser(user.id, true)}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Block
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
