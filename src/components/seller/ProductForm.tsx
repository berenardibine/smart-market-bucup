import { useState, useEffect } from "react";
import { ArrowLeft, X, Plus, Video, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  product?: any;
  shopId?: string;
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

const ProductForm = ({ product, shopId, onSuccess, onCancel }: ProductFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { categories } = useCategories();
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
    // Rental fields
    rental_fee: product?.rental_fee?.toString() || '',
    rental_unit: product?.rental_unit || 'day',
  });

  // Check if selected category is a rental category
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

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
    const filePath = `${user?.id}/${fileName}`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please add at least one image", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category || null,
        product_type: isRentalCategory ? 'rental' : formData.product_type,
        is_negotiable: formData.is_negotiable,
        images: images,
        video_url: videoUrl || null,
        seller_id: user.id,
        shop_id: shopId || null,
        location: null,
        location_id: profile.sector_id,
        contact_whatsapp: profile.whatsapp_number,
        contact_call: profile.call_number,
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
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
      }

      onSuccess();
    } catch (err: any) {
      toast({ title: "Failed to save product", description: err.message, variant: "destructive" });
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
          <h1 className="font-semibold text-lg">
            {product ? 'Edit Product' : 'Add New Product'}
          </h1>
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
                {processingImages.has(idx) && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Processing
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                  disabled={processingImages.has(idx)}
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
                <p className="text-sm text-muted-foreground">Add a video to showcase your product</p>
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
            <SelectContent className="bg-card">
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rental Fields - Show automatically for rental categories */}
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

        {/* Negotiable */}
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
          />
        </div>

        {/* Location Info */}
        <div className="bg-primary/5 rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">📍 Location (Auto-filled)</h3>
          <p className="text-sm text-muted-foreground">
            Location will be set from your profile
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;