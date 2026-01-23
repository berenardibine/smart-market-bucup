import { useState, useEffect } from 'react';
import { 
  ArrowLeft, X, Plus, Video, Loader2, Sparkles, 
  Phone, MapPin, ShieldCheck, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';

interface AdminProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RENTAL_UNITS = [
  { value: 'day', label: '/day' },
  { value: 'week', label: '/week' },
  { value: 'month', label: '/month' },
  { value: 'year', label: '/year' },
  { value: 'custom', label: '/custom' },
];

const AdminProductForm = ({ product, onSuccess, onCancel }: AdminProductFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { categories } = useCategories();
  const {
    provinces,
    districts,
    sectors,
    selectedProvince,
    selectedDistrict,
    selectedSector,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedSector,
  } = useLocations();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [processingImages, setProcessingImages] = useState<Set<number>>(new Set());
  const [videoUrl, setVideoUrl] = useState(product?.video_url || '');
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    quantity: product?.quantity?.toString() || '1',
    category: product?.category || '',
    product_type: product?.product_type || 'retail',
    is_negotiable: product?.is_negotiable || false,
    admin_posted: product?.admin_posted ?? true,
    admin_phone: product?.admin_phone || product?.contact_whatsapp || '',
    sponsored: product?.sponsored || false,
    // Rental fields
    rental_fee: product?.rental_fee?.toString() || '',
    rental_unit: product?.rental_unit || 'day',
  });

  // Check if category is rental
  const isRentalCategory = formData.category?.toLowerCase().includes('rent') || 
    formData.category?.toLowerCase().includes('lent') ||
    formData.product_type === 'rental';

  // Pre-fill location from product
  useEffect(() => {
    if (product?.location_id) {
      // Load location hierarchy from product
      const loadProductLocation = async () => {
        try {
          const { data: sector } = await supabase
            .from('locations')
            .select('id, parent_id, name')
            .eq('id', product.location_id)
            .single();
          
          if (sector) {
            const { data: district } = await supabase
              .from('locations')
              .select('id, parent_id, name')
              .eq('id', sector.parent_id)
              .single();
            
            if (district) {
              const { data: province } = await supabase
                .from('locations')
                .select('id, name')
                .eq('id', district.parent_id)
                .single();
              
              if (province) {
                setSelectedProvince(province.id);
                setTimeout(() => {
                  setSelectedDistrict(district.id);
                  setTimeout(() => {
                    setSelectedSector(sector.id);
                  }, 100);
                }, 100);
              }
            }
          }
        } catch (err) {
          console.error('Error loading product location:', err);
        }
      };
      loadProductLocation();
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 8) {
      toast({ title: "Maximum 8 images allowed", variant: "destructive" });
      return;
    }

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `admin/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        setImages(prev => [...prev, publicUrl]);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `admin/${fileName}`;

    const { error } = await supabase.storage
      .from('product-videos')
      .upload(filePath, file);

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);
      
      setVideoUrl(publicUrl);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getLocationString = () => {
    const parts = [];
    const sector = sectors.find(s => s.id === selectedSector);
    const district = districts.find(d => d.id === selectedDistrict);
    const province = provinces.find(p => p.id === selectedProvince);
    
    if (sector) parts.push(sector.name);
    if (district) parts.push(district.name);
    if (province) parts.push(province.name);
    
    return parts.join(', ') || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please add at least one image", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.price) {
      toast({ title: "Title and price are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const locationString = getLocationString();
      
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 1,
        category: formData.category || null,
        product_type: isRentalCategory ? 'rental' : formData.product_type,
        is_negotiable: formData.is_negotiable,
        images: images,
        video_url: videoUrl || null,
        seller_id: user.id,
        location: locationString,
        location_id: selectedSector || null,
        admin_posted: formData.admin_posted,
        admin_phone: formData.admin_phone || null,
        admin_location: locationString,
        show_connect_button: !formData.admin_posted,
        sponsored: formData.sponsored,
        last_edited_by: user.id,
        contact_whatsapp: formData.admin_phone || null,
        contact_call: formData.admin_phone || null,
        status: 'active',
      };

      // Add rental fields if applicable
      if (isRentalCategory) {
        productData.rental_fee = formData.rental_fee ? parseFloat(formData.rental_fee) : parseFloat(formData.price);
        productData.rental_unit = formData.rental_unit;
        productData.rental_status = 'available';
      }

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
        toast({ title: "Product updated successfully! ✨" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        toast({ title: "Product posted successfully! 🎉" });
      }

      onSuccess();
    } catch (err: any) {
      toast({ 
        title: "Failed to save product", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">
              {product ? 'Edit Product' : 'Admin: New Product'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {product ? 'Editing product as admin' : 'Post as Smart Market official'}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Admin Controls */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Admin Controls
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="admin_posted">Admin Posted</Label>
              <p className="text-xs text-muted-foreground">
                Mark as official Smart Market product (hides badges)
              </p>
            </div>
            <Switch
              id="admin_posted"
              checked={formData.admin_posted}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                admin_posted: checked 
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sponsored">Sponsored / Featured</Label>
              <p className="text-xs text-muted-foreground">
                Highlight at top of listings
              </p>
            </div>
            <Switch
              id="sponsored"
              checked={formData.sponsored}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                sponsored: checked 
              }))}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label>Product Images (Max 8) *</Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {processingImages.has(idx) && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Processing</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-primary/50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                <Plus className="h-6 w-6 text-primary/50 mb-1" />
                <span className="text-xs text-muted-foreground">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Video Upload */}
        <div className="space-y-2">
          <Label>Product Video (Optional)</Label>
          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <video src={videoUrl} controls className="w-full aspect-video" />
              <button
                type="button"
                onClick={() => setVideoUrl('')}
                className="absolute top-2 right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <Video className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Upload Video</p>
                <p className="text-sm text-muted-foreground">Add a video to showcase the product</p>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="title">Product Name *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (RWF) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="1"
              required
              min="1"
            />
          </div>
        </div>

        {/* Category - Load from Database */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-card max-h-[300px]">
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rental Fields - Show only for rental categories */}
        {isRentalCategory && (
          <div className="bg-primary/5 rounded-2xl p-4 space-y-4 border border-primary/20">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              🔧 Rental Fee Details
            </h3>
            <p className="text-sm text-muted-foreground">
              This category requires rental pricing. Set the fee rate below.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rental Fee (RWF)</Label>
                <Input
                  type="number"
                  value={formData.rental_fee || formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    rental_fee: e.target.value,
                    price: e.target.value // Sync with main price
                  }))}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>Rate Unit</Label>
                <Select
                  value={formData.rental_unit}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    rental_unit: value 
                  }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {RENTAL_UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-primary font-medium">
              Display: Fr {formData.rental_fee || formData.price || '0'}/{formData.rental_unit}
            </p>
          </div>
        )}

        {/* Product Type - Hide for rental categories */}
        {!isRentalCategory && (
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Select
              value={formData.product_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Admin Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="admin_phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Phone Number *
          </Label>
          <Input
            id="admin_phone"
            value={formData.admin_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
            placeholder="+250 7XX XXX XXX"
            required
          />
          <p className="text-xs text-muted-foreground">
            This number will be used for WhatsApp and calls
          </p>
        </div>

        {/* Location Selection */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Product Location *
          </Label>
          
          <Select
            value={selectedProvince}
            onValueChange={(value) => {
              setSelectedProvince(value);
              setSelectedDistrict('');
              setSelectedSector('');
            }}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              {provinces.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProvince && (
            <Select
              value={selectedDistrict}
              onValueChange={(value) => {
                setSelectedDistrict(value);
                setSelectedSector('');
              }}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {districts.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedDistrict && (
            <Select
              value={selectedSector}
              onValueChange={setSelectedSector}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {sectors.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Negotiable */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div>
            <Label htmlFor="negotiable">Price is Negotiable</Label>
            <p className="text-sm text-muted-foreground">Allow buyers to negotiate</p>
          </div>
          <Switch
            id="negotiable"
            checked={formData.is_negotiable}
            onCheckedChange={(checked) => setFormData(prev => ({ 
              ...prev, 
              is_negotiable: checked 
            }))}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the product in detail..."
            rows={4}
            required
          />
        </div>

        {/* Info Box for Admin Products */}
        {formData.admin_posted && (
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <h4 className="font-medium text-amber-700 mb-2">⚠️ Admin Product Note</h4>
            <ul className="text-sm text-amber-600 space-y-1">
              <li>• "Connect with Seller" button will be hidden</li>
              <li>• "I Need This Product" button will be hidden</li>
              <li>• No badges will be shown on this product</li>
              <li>• Product marked as official Smart Market listing</li>
            </ul>
          </div>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            product ? 'Update Product' : 'Post Product'
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdminProductForm;