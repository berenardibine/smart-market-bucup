import { useState, useEffect } from "react";
import { ArrowLeft, X, Plus, Loader2, Sparkles, Zap } from "lucide-react";
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
import { useFileOptimization } from "@/hooks/useFileOptimization";
import { compressImage, isFileSizeAcceptable, formatFileSize } from "@/lib/imageCompressor";

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
  const { optimizeFile, isOptimizing: isOptimizingFile } = useFileOptimization();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [processingImages, setProcessingImages] = useState<Set<number>>(new Set());
  const [optimizingImages, setOptimizingImages] = useState<Set<number>>(new Set());
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

    if (images.length + files.length > 5) {
      toast({ title: "Maximum 5 images allowed", variant: "destructive" });
      return;
    }

    toast({ 
      title: "🧠 AI Processing Image", 
      description: "Compressing, resizing & optimizing..."
    });

    for (const file of Array.from(files)) {
      try {
        // Step 1: Client-side compression to ≤100KB, 512x512, 1:1
        const compressed = await compressImage(file, {
          maxSizeKB: 20,
          maxDimension: 512,
          forceSquare: true,
          format: 'image/webp',
        });

        if (!isFileSizeAcceptable(compressed.blob, 20)) {
          toast({
            title: "File too large after optimization",
            description: "Please upload a smaller or compressed version.",
            variant: "destructive",
          });
          continue;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
        const filePath = `${user?.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressed.blob, {
            contentType: compressed.format,
          });

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const currentIndex = images.length;
        setImages(prev => [...prev, publicUrl]);
        setProcessingImages(prev => new Set(prev).add(currentIndex));

        // Step 2: Smart AI background processing
        const bgResult = await processBackground(publicUrl);
        let processedUrl = bgResult.url;

        setImages(prev => prev.map((img, idx) =>
          idx === currentIndex ? processedUrl : img
        ));
        setProcessingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentIndex);
          return newSet;
        });

        // Step 3: Server-side AI optimization (enhance quality)
        setOptimizingImages(prev => new Set(prev).add(currentIndex));

        const optimizeResult = await optimizeFile(processedUrl, 'product_card', true);

        if (optimizeResult && optimizeResult.optimizedUrl !== processedUrl) {
          processedUrl = optimizeResult.optimizedUrl;
          setImages(prev => prev.map((img, idx) =>
            idx === currentIndex ? processedUrl : img
          ));
        }

        setOptimizingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentIndex);
          return newSet;
        });

        toast({
          title: "✨ Image Optimized",
          description: `Compressed ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${compressed.compressionRatio}% saved)`,
        });

        if (bgResult.decision === 'removed') {
          toast({
            title: "✨ Background Cleaned",
            description: "Product photo optimized with white background",
          });
        }
      } catch (err) {
        console.error('Image processing error:', err);
        toast({
          title: "Upload failed",
          description: "Could not process this image. Try a different one.",
          variant: "destructive",
        });
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
        price: formData.price ? parseFloat(formData.price) : 0,
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
        // Global country fields - auto-filled from seller profile
        country: profile.country || null,
        currency_code: profile.currency_code || 'RWF',
        currency_symbol: profile.currency_symbol || 'R₣',
        // GPS coordinates from seller profile
        lat: (profile as any).lat || null,
        lng: (profile as any).lng || null,
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
          <Label>Product Images (Max 5) *</Label>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {processingImages.has(idx) && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Background
                    </span>
                  </div>
                )}
                {optimizingImages.has(idx) && !processingImages.has(idx) && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Optimizing
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                  disabled={processingImages.has(idx) || optimizingImages.has(idx)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
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
            />
            {formData.is_negotiable && (
              <p className="text-xs text-muted-foreground">Optional when price is negotiable</p>
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