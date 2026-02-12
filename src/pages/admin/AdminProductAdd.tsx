import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, X, Plus, Video, Loader2, 
  Phone, MapPin, Sparkles
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
import { compressImage, isFileSizeAcceptable, formatFileSize } from '@/lib/imageCompressor';
import { useCategories } from '@/hooks/useCategories';
import { useLocations } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

const RENTAL_UNITS = [
  { value: 'day', label: '/day' },
  { value: 'week', label: '/week' },
  { value: 'month', label: '/month' },
  { value: 'year', label: '/year' },
];

const AdminProductAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
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
  const [images, setImages] = useState<string[]>([]);
  const [processingImages, setProcessingImages] = useState<Set<number>>(new Set());
  const [videoUrl, setVideoUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '1',
    category: '',
    product_type: 'retail',
    is_negotiable: false,
    admin_phone: '',
    rental_fee: '',
    rental_unit: 'day',
  });

  // Check if category is rental
  const isRentalCategory = formData.category?.toLowerCase().includes('rent') || 
    formData.category?.toLowerCase().includes('lent') ||
    formData.product_type === 'rental';

  // Smart AI Background processing function
  const processBackground = async (imageUrl: string): Promise<{ url: string; decision: string; message: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { imageUrl, userId: user?.id }
      });

      if (error) {
        console.error('Background processing error:', error);
        return { url: imageUrl, decision: 'error', message: 'Processing failed' };
      }

      return {
        url: data?.processedUrl || imageUrl,
        decision: data?.analysis?.decision || 'unknown',
        message: data?.message || data?.analysis?.reason || ''
      };
    } catch (err) {
      console.error('Background processing failed:', err);
      return { url: imageUrl, decision: 'error', message: 'Processing failed' };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 8) {
      toast({ title: "Maximum 8 images allowed", variant: "destructive" });
      return;
    }

    toast({ 
      title: "🧠 AI Analyzing Image", 
      description: "Smart background detection in progress..."
    });

    for (const file of Array.from(files)) {
      // Compress image before upload
      let uploadFile: File | Blob = file;
      try {
        const result = await compressImage(file, { maxSizeKB: 100, maxDimension: 512, forceSquare: false });
        if (!isFileSizeAcceptable(result.blob)) {
          toast({ title: "File too large after optimization", description: "Please upload a smaller image.", variant: "destructive" });
          continue;
        }
        uploadFile = result.blob;
        toast({ title: `📦 Compressed: ${formatFileSize(file.size)} → ${formatFileSize(result.compressedSize)}` });
      } catch (err) {
        console.error('Compression failed, uploading original:', err);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `admin/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, uploadFile);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        // Add original image first with processing indicator
        const currentIndex = images.length;
        setImages(prev => [...prev, publicUrl]);
        setProcessingImages(prev => new Set(prev).add(currentIndex));
        
        // Smart AI background processing
        const result = await processBackground(publicUrl);
        
        // Update with processed or original image based on AI decision
        setImages(prev => prev.map((img, idx) => 
          idx === currentIndex ? result.url : img
        ));
        setProcessingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentIndex);
          return newSet;
        });

        // Show appropriate toast based on AI decision
        if (result.decision === 'removed') {
          toast({ 
            title: "✨ Background Cleaned", 
            description: "Product photo optimized with white background"
          });
        } else if (result.decision === 'keep') {
          toast({ 
            title: "🌈 Background Preserved", 
            description: result.message || "Background kept to preserve visual context"
          });
        } else if (result.decision === 'remove_failed') {
          toast({ 
            title: "📷 Original Saved", 
            description: "Image saved without background processing"
          });
        }
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

    if (!formData.title) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }

    // Price is only required if not negotiable
    if (!formData.is_negotiable && !formData.price) {
      toast({ title: "Price is required when not negotiable", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const locationString = getLocationString();
      
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : 0,
        quantity: parseInt(formData.quantity) || 1,
        category: formData.category || null,
        product_type: isRentalCategory ? 'rental' : formData.product_type,
        is_negotiable: formData.is_negotiable,
        images: images,
        video_url: videoUrl || null,
        seller_id: user.id,
        location: locationString,
        location_id: selectedSector || null,
        admin_posted: true,
        admin_phone: formData.admin_phone || null,
        admin_location: locationString,
        show_connect_button: false,
        sponsored: false,
        last_edited_by: user.id,
        contact_whatsapp: formData.admin_phone || null,
        contact_call: formData.admin_phone || null,
        status: 'active',
      };

      if (isRentalCategory) {
        productData.rental_fee = formData.rental_fee ? parseFloat(formData.rental_fee) : parseFloat(formData.price);
        productData.rental_unit = formData.rental_unit;
        productData.rental_status = 'available';
      }

      const { error } = await supabase
        .from('products')
        .insert(productData);
      
      if (error) throw error;
      toast({ title: "Product posted successfully! 🎉" });
      navigate('/admin/products');
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

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            onClick={() => navigate('/admin/products')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg">Add New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Product Images (Max 8) *
            <span className="text-xs text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Smart Background
            </span>
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {processingImages.has(idx) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-1" />
                      <p className="text-white text-xs">AI Processing...</p>
                    </div>
                  </div>
                )}
                {!processingImages.has(idx) && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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

        {/* Negotiable Toggle - Move before price */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div>
            <Label htmlFor="negotiable">Price is Negotiable</Label>
            <p className="text-sm text-muted-foreground">
              {formData.is_negotiable 
                ? "Price field becomes optional" 
                : "Buyers will see a fixed price"}
            </p>
          </div>
          <Switch
            id="negotiable"
            checked={formData.is_negotiable}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_negotiable: checked }))}
          />
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (RWF) {!formData.is_negotiable && '*'}
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder={formData.is_negotiable ? "Optional" : "0"}
              required={!formData.is_negotiable}
              className="rounded-xl"
            />
            {formData.is_negotiable && !formData.price && (
              <p className="text-xs text-muted-foreground">
                Will show "Negotiable" instead of price
              </p>
            )}
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

        {/* Category */}
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

        {/* Rental Fields */}
        {isRentalCategory && (
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
                    price: e.target.value
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
          </div>
        )}

        {/* Product Type */}
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

        {/* Phone Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            value={formData.admin_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
            placeholder="+250..."
            className="rounded-xl"
          />
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Adding...
            </>
          ) : (
            'Add Product'
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdminProductAdd;
