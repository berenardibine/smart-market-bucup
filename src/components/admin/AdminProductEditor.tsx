import { useState, useEffect } from 'react';
import { 
  ArrowLeft, X, Plus, Video, Loader2, 
  Phone, MapPin, Save, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

interface AdminProductEditorProps {
  product: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RENTAL_UNITS = [
  { value: '', label: 'Not for rent' },
  { value: 'day', label: '/day' },
  { value: 'week', label: '/week' },
  { value: 'month', label: '/month' },
  { value: 'year', label: '/year' },
  { value: 'custom', label: '/custom' },
];

const AdminProductEditor = ({ product, onSuccess, onCancel }: AdminProductEditorProps) => {
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
  const [videoUrl, setVideoUrl] = useState(product?.video_url || '');
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    quantity: product?.quantity?.toString() || '1',
    category: product?.category || '',
    product_type: product?.product_type || 'retail',
    is_negotiable: product?.is_negotiable || false,
    admin_posted: product?.admin_posted || false,
    sponsored: product?.sponsored || false,
    admin_phone: product?.admin_phone || product?.contact_whatsapp || '',
    admin_location: product?.admin_location || product?.location || '',
    contact_call: product?.contact_call || '',
    contact_whatsapp: product?.contact_whatsapp || '',
    show_connect_button: product?.show_connect_button ?? true,
    rental_fee: product?.rental_fee?.toString() || '',
    rental_unit: product?.rental_unit || '',
  });

  // Check if category is rental
  const isRentalCategory = formData.category?.toLowerCase().includes('rent') || 
    formData.category?.toLowerCase().includes('lent') ||
    formData.product_type === 'rental';

  // Pre-fill location from product
  useEffect(() => {
    if (product?.location_id) {
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
        toast({ title: "Image uploaded successfully" });
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
      toast({ title: "Video uploaded successfully" });
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
    
    return parts.join(', ') || formData.admin_location || null;
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
        location: locationString,
        location_id: selectedSector || product?.location_id || null,
        admin_posted: formData.admin_posted,
        admin_phone: formData.admin_phone || null,
        admin_location: locationString,
        show_connect_button: !formData.admin_posted,
        sponsored: formData.sponsored,
        last_edited_by: user.id,
        contact_whatsapp: formData.contact_whatsapp || formData.admin_phone || null,
        contact_call: formData.contact_call || formData.admin_phone || null,
      };

      // Add rental fields if applicable
      if (isRentalCategory || formData.rental_unit) {
        productData.rental_fee = formData.rental_fee ? parseFloat(formData.rental_fee) : parseFloat(formData.price);
        productData.rental_unit = formData.rental_unit;
        productData.rental_status = 'available';
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);
      
      if (error) throw error;
      toast({ title: "Product updated successfully! ✨" });
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
          <h1 className="font-semibold text-lg">Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <Label>Product Images (Max 8) *</Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={img} alt="" className="w-full h-full object-cover" />
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
            className="rounded-xl"
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
              className="rounded-xl"
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
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Category - Load from Database */}
        <div className="space-y-2">
          <Label>Category</Label>
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

        {/* Product Type */}
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
              <SelectItem value="rental">Equipment for Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rental Fields */}
        {(isRentalCategory || formData.product_type === 'rental') && (
          <div className="bg-primary/5 rounded-2xl p-4 space-y-4 border border-primary/20">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              🔧 Rental Fee Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rental Fee (RWF)</Label>
                <Input
                  type="number"
                  value={formData.rental_fee || formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    rental_fee: e.target.value,
                  }))}
                  placeholder="50000"
                  className="rounded-xl"
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
                    <SelectValue placeholder="Select rate" />
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
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <Label htmlFor="negotiable">Price is Negotiable</Label>
              <p className="text-sm text-muted-foreground">Allow buyers to negotiate the price</p>
            </div>
            <Switch
              id="negotiable"
              checked={formData.is_negotiable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_negotiable: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div>
              <Label htmlFor="admin_posted" className="text-amber-800">Admin Posted</Label>
              <p className="text-sm text-amber-600">Mark as official Smart Market product</p>
            </div>
            <Switch
              id="admin_posted"
              checked={formData.admin_posted}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                admin_posted: checked,
                show_connect_button: !checked
              }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div>
              <Label htmlFor="sponsored" className="text-purple-800">Featured / Sponsored</Label>
              <p className="text-sm text-purple-600">Highlight at top of listings</p>
            </div>
            <Switch
              id="sponsored"
              checked={formData.sponsored}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sponsored: checked }))}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your product in detail..."
            rows={4}
            required
            className="rounded-xl"
          />
        </div>

        {/* Location Selection */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </Label>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
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
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
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
            <Select value={selectedSector} onValueChange={setSelectedSector}>
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

        {/* Contact Numbers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Number
            </Label>
            <Input
              value={formData.contact_call}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_call: e.target.value }))}
              placeholder="+250..."
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input
              value={formData.contact_whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
              placeholder="+250..."
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdminProductEditor;
