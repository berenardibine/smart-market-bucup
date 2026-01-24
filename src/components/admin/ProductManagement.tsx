import { useState, useEffect } from "react";
import { 
  Package, Search, MoreVertical, Trash2, Edit, Eye, 
  Plus, Tag, RefreshCw, CheckCircle, Clock, Sparkles
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import AdminProductForm from "./AdminProductForm";
import AdminProductEditor from "./AdminProductEditor";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { categories: dbCategories } = useCategories();

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles!products_seller_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Failed to delete product", variant: "destructive" });
    } else {
      toast({ title: "Product deleted successfully" });
      fetchProducts();
    }
  };

  const handleApproveProduct = async (id: string) => {
    const { error } = await supabase.from('products').update({ status: 'active' }).eq('id', id);
    
    if (error) {
      toast({ title: "Failed to approve product", variant: "destructive" });
    } else {
      toast({ title: "Product approved" });
      fetchProducts();
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All' },
    ...dbCategories.map(c => ({ value: c.slug, label: c.name }))
  ];

  // Show add form
  if (showAddForm) {
    return (
      <AdminProductForm
        onSuccess={() => {
          setShowAddForm(false);
          fetchProducts();
        }}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  // Show edit form
  if (editingProduct) {
    return (
      <AdminProductEditor
        product={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
          fetchProducts();
        }}
        onCancel={() => setEditingProduct(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
          <TabsTrigger value="list" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Product
          </TabsTrigger>
        </TabsList>

        {/* Products List Tab */}
        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-white"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              className="h-12 gap-2 rounded-xl bg-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 border">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <p className="text-xl font-bold">{products.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Tag className="h-4 w-4" />
                <span className="text-xs font-medium">Admin</span>
              </div>
              <p className="text-xl font-bold">{products.filter(p => p.admin_posted).length}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">Sponsored</span>
              </div>
              <p className="text-xl font-bold">{products.filter(p => p.sponsored).length}</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoryOptions.slice(0, 8).map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  categoryFilter === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-muted-foreground border hover:bg-muted"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product List */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-white">
              <h3 className="font-semibold">Products ({filteredProducts.length})</h3>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-16" />
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No products found
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{product.title}</p>
                        {product.admin_posted && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Admin</Badge>
                        )}
                        {product.sponsored && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">Sponsored</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.seller?.full_name} • {product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.views || 0}
                        </Badge>
                        <Badge 
                          className={cn(
                            "text-xs",
                            product.status === 'active' 
                              ? "bg-green-100 text-green-700" 
                              : product.status === 'pending'
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {product.status}
                        </Badge>
                        {product.rental_unit && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            /{product.rental_unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => navigate(`/product/${product.slug || product.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {product.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleApproveProduct(product.id)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagement;
