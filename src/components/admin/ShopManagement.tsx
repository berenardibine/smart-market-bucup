import { useState } from "react";
import { 
  Store, Users, Package, MapPin, Search, MoreVertical,
  Trash2, Ban, Edit, Eye, CheckCircle
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
import { useAdminShops } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

const ShopManagement = () => {
  const { shops, loading, deleteShop, refetch } = useAdminShops();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShops = shops.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteShop = async (id: string) => {
    if (!confirm('Are you sure? This will also remove all products from this shop.')) return;
    const { error } = await deleteShop(id);
    if (error) {
      toast({ title: "Failed to delete shop", variant: "destructive" });
    } else {
      toast({ title: "Shop deleted successfully" });
      refetch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search shops by name or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Store className="h-4 w-4" />
            <span className="text-xs font-medium">Total Shops</span>
          </div>
          <p className="text-2xl font-bold">{shops.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">{shops.filter(s => s.status === 'active').length}</p>
        </div>
      </div>

      {/* Shop List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
          <h3 className="font-semibold">All Shops ({filteredShops.length})</h3>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-20" />
              </div>
            ))
          ) : filteredShops.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No shops found
            </div>
          ) : (
            filteredShops.map(shop => (
              <div key={shop.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center overflow-hidden">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{shop.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Users className="h-3 w-3" />
                    <span>{shop.owner?.full_name || 'Unknown Owner'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{shop.trading_center || 'No location'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Package className="h-3 w-3 mr-1" />
                      Products
                    </Badge>
                    <Badge 
                      className={cn(
                        "text-xs",
                        shop.status === 'active' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {shop.status || 'active'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                      Block Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteShop(shop.id)}
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
    </div>
  );
};

export default ShopManagement;
