import { useState, useEffect } from "react";
import { 
  Package, Search, MoreVertical, Trash2, Edit, Eye, 
  Plus, Tag, DollarSign, RefreshCw, CheckCircle, X, Image as ImageIcon,
  Upload, Phone, MapPin, Sparkles, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { useLocations } from "@/hooks/useLocations";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ProductManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for admin product posting
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '1',
    category: 'general',
    is_negotiable: false,
    admin_posted: true,
    sponsored: false,
    admin_phone: '',
    admin_location: '',
    show_connect_button: false,
    contact_call: '',
    contact_whatsapp: '',
    video_url: '',
    images: [] as string[],
    rental_unit: '',
    product_type: 'general',
  });

  // Location hooks
  const { 
    provinces, districts, sectors,
    selectedProvince, selectedDistrict, selectedSector,
    setSelectedProvince, setSelectedDistrict, setSelectedSector 
  } = useLocations();

  // Categories
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

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      quantity: product.quantity?.toString() || '1',
      category: product.category || 'general',
      is_negotiable: product.is_negotiable || false,
      admin_posted: product.admin_posted || false,
      sponsored: product.sponsored || false,
      admin_phone: product.admin_phone || '',
      admin_location: product.admin_location || product.location || '',
      show_connect_button: product.show_connect_button ?? true,
      contact_call: product.contact_call || '',
      contact_whatsapp: product.contact_whatsapp || '',
      video_url: product.video_url || '',
      images: product.images || [],
      rental_unit: product.rental_unit || '',
      product_type: product.product_type || 'general',
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
      admin_posted: true,
      sponsored: false,
      admin_phone: '',
      admin_location: '',
      show_connect_button: false,
      contact_call: '',
      contact_whatsapp: '',
      video_url: '',
      images: [],
      rental_unit: '',
      product_type: 'general',
    });
    setSelectedProduct(null);
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedSector('');
  };

  // Build location string from selections
  const buildLocationString = () => {
    const parts = [];
    if (selectedSector) {
      const sector = sectors.find(s => s.id === selectedSector);
      if (sector) parts.push(sector.name);
    }
    if (selectedDistrict) {
      const district = districts.find(d => d.id === selectedDistrict);
      if (district) parts.push(district.name);
    }
    if (selectedProvince) {
      const province = provinces.find(p => p.id === selectedProvince);
      if (province) parts.push(province.name);
    }
    return parts.join(', ') || 'Rwanda';
  };

  const handleAdminPostProduct = async () => {
    if (!formData.title || !formData.price || !formData.description) {
      toast({ title: "Title, price, and description are required", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      category: formData.category,
      is_negotiable: formData.is_negotiable,
      admin_posted: true,
      sponsored: formData.sponsored,
      admin_phone: formData.admin_phone || formData.contact_call,
      admin_location: buildLocationString(),
      location: buildLocationString(),
      location_id: selectedSector || selectedDistrict || selectedProvince || null,
      show_connect_button: false,
      contact_call: formData.contact_call,
      contact_whatsapp: formData.contact_whatsapp,
      video_url: formData.video_url,
      images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
      rental_unit: formData.rental_unit || null,
      product_type: formData.product_type,
      seller_id: user.id,
      last_edited_by: user.id,
      status: 'active',
    };

    const { error } = await supabase.from('products').insert(productData);

    setSubmitting(false);

    if (error) {
      console.error('Error posting product:', error);
      toast({ title: "Failed to post product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product posted successfully! 🎉" });
      resetForm();
      fetchProducts();
      setActiveTab('list');
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price || !formData.description) {
      toast({ title: "Title, price, and description are required", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      category: formData.category,
      is_negotiable: formData.is_negotiable,
      admin_posted: formData.admin_posted,
      sponsored: formData.sponsored,
      admin_phone: formData.admin_phone,
      admin_location: formData.admin_location,
      show_connect_button: formData.show_connect_button,
      contact_call: formData.contact_call,
      contact_whatsapp: formData.contact_whatsapp,
      video_url: formData.video_url,
      images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
      rental_unit: formData.rental_unit || null,
      product_type: formData.product_type,
      last_edited_by: user?.id,
    };

    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', selectedProduct.id);

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to update product", variant: "destructive" });
    } else {
      toast({ title: "Product updated!" });
      fetchProducts();
      setShowEditDialog(false);
      resetForm();
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    ...dbCategories.map(c => ({ value: c.slug, label: c.name }))
  ];

  const rentalUnits = [
    { value: '', label: 'Not for rent' },
    { value: 'day', label: 'Per Day' },
    { value: 'week', label: 'Per Week' },
    { value: 'month', label: 'Per Month' },
    { value: 'year', label: 'Per Year' },
  ];

  const productTypes = [
    { value: 'general', label: 'General' },
    { value: 'asset', label: 'Asset' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'rent', label: 'Equipment for Rent' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-[300px]">
          <TabsTrigger value="list" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
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
        </TabsContent>

        {/* Add Product Tab */}
        <TabsContent value="add" className="mt-4">
          <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Post Admin Product</h2>
                <p className="text-sm text-muted-foreground">Official Smart Market listing</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Title *</Label>
                  <Input
                    placeholder="Product title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Description *</Label>
                  <Textarea
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Price (RWF) *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {dbCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Product Type</Label>
                    <Select
                      value={formData.product_type}
                      onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {productTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rental Unit - Shows when product type is rent */}
                {formData.product_type === 'rent' && (
                  <div>
                    <Label className="mb-2 block">Rental Rate</Label>
                    <Select
                      value={formData.rental_unit}
                      onValueChange={(value) => setFormData({ ...formData, rental_unit: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select rental period" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {rentalUnits.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Location Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {provinces.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedProvince && (
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {districts.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedDistrict && (
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Sector" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sectors.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Number
                    </Label>
                    <Input
                      placeholder="+250..."
                      value={formData.contact_call}
                      onChange={(e) => setFormData({ ...formData, contact_call: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">WhatsApp</Label>
                    <Input
                      placeholder="+250..."
                      value={formData.contact_whatsapp}
                      onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label>Price is Negotiable</Label>
                    <Switch
                      checked={formData.is_negotiable}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_negotiable: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Featured/Sponsored
                    </Label>
                    <Switch
                      checked={formData.sponsored}
                      onCheckedChange={(checked) => setFormData({ ...formData, sponsored: checked })}
                    />
                  </div>
                </div>

                {/* Admin Badge */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Official Smart Market Listing</span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    This product will be marked as admin-posted. Connect button will be hidden.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm} className="rounded-xl">
                Clear Form
              </Button>
              <Button 
                onClick={handleAdminPostProduct} 
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-primary to-orange-400 gap-2"
              >
                {submitting ? 'Posting...' : (
                  <>
                    <Upload className="h-4 w-4" />
                    Post Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2 block">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Price (RWF)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {dbCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.product_type === 'rent' && (
                <div>
                  <Label className="mb-2 block">Rental Rate</Label>
                  <Select
                    value={formData.rental_unit}
                    onValueChange={(value) => setFormData({ ...formData, rental_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rental period" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {rentalUnits.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Call Number</Label>
                  <Input
                    value={formData.contact_call}
                    onChange={(e) => setFormData({ ...formData, contact_call: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">WhatsApp</Label>
                  <Input
                    value={formData.contact_whatsapp}
                    onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Location</Label>
                <Input
                  value={formData.admin_location}
                  onChange={(e) => setFormData({ ...formData, admin_location: e.target.value })}
                />
              </div>
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <Label>Negotiable</Label>
                  <Switch
                    checked={formData.is_negotiable}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_negotiable: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Admin Posted</Label>
                  <Switch
                    checked={formData.admin_posted}
                    onCheckedChange={(checked) => setFormData({ ...formData, admin_posted: checked, show_connect_button: !checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sponsored</Label>
                  <Switch
                    checked={formData.sponsored}
                    onCheckedChange={(checked) => setFormData({ ...formData, sponsored: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
