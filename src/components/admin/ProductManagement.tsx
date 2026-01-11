import { useState, useEffect } from "react";
import { 
  Package, Search, MoreVertical, Trash2, Edit, Eye, 
  Plus, Tag, DollarSign, RefreshCw, CheckCircle, X, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '1',
    category: 'general',
    is_negotiable: false,
    location: '',
    contact_call: '',
    contact_whatsapp: '',
    video_url: '',
    images: [] as string[],
  });

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

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      quantity: product.quantity?.toString() || '1',
      category: product.category || 'general',
      is_negotiable: product.is_negotiable || false,
      location: product.location || '',
      contact_call: product.contact_call || '',
      contact_whatsapp: product.contact_whatsapp || '',
      video_url: product.video_url || '',
      images: product.images || [],
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      quantity: '1',
      category: 'general',
      is_negotiable: false,
      location: '',
      contact_call: '',
      contact_whatsapp: '',
      video_url: '',
      images: [],
    });
    setSelectedProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price || !formData.description) {
      toast({ title: "Title, price, and description are required", variant: "destructive" });
      return;
    }

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      category: formData.category,
      is_negotiable: formData.is_negotiable,
      location: formData.location,
      contact_call: formData.contact_call,
      contact_whatsapp: formData.contact_whatsapp,
      video_url: formData.video_url,
      images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
    };

    if (selectedProduct) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', selectedProduct.id);

      if (error) {
        toast({ title: "Failed to update product", variant: "destructive" });
      } else {
        toast({ title: "Product updated!" });
        fetchProducts();
        setShowEditDialog(false);
        resetForm();
      }
    } else {
      toast({ title: "Please use seller dashboard to add products", variant: "destructive" });
    }
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    { value: 'asset', label: 'Asset' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'rent', label: 'For Rent' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'food-drinks', label: 'Food' },
    { value: 'health-care', label: 'Health' },
  ];

  return (
    <div className="space-y-4">
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
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="text-xl font-bold">{products.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Avg Price</span>
          </div>
          <p className="text-lg font-bold">
            {products.length > 0 ? formatPrice(products.reduce((a, b) => a + (b.price || 0), 0) / products.length) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              categoryFilter === cat.value
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground border hover:bg-gray-50"
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
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <img 
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
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
                    <DropdownMenuItem onClick={() => navigate(`/product/${product.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(product)}>
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

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="Product title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Price (RWF) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="rent">Equipment for Rent</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="food-drinks">Food & Drinks</SelectItem>
                  <SelectItem value="health-care">Health & Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="negotiable"
                checked={formData.is_negotiable}
                onCheckedChange={(checked) => setFormData({ ...formData, is_negotiable: !!checked })}
              />
              <label htmlFor="negotiable" className="text-sm">Price is negotiable</label>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="Product location..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Call Number</label>
                <Input
                  placeholder="+250..."
                  value={formData.contact_call}
                  onChange={(e) => setFormData({ ...formData, contact_call: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">WhatsApp</label>
                <Input
                  placeholder="+250..."
                  value={formData.contact_whatsapp}
                  onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Video URL</label>
              <Input
                placeholder="https://..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
