import { useState } from "react";
import { ArrowLeft, Store, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ShopFormProps {
  shop?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ShopForm = ({ shop, onSubmit, onCancel }: ShopFormProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(shop?.logo_url || '');
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    description: shop?.description || '',
    trading_center: shop?.trading_center || '',
    logo_url: shop?.logo_url || '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `shop-logos/${fileName}`;

    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      setLogoPreview(publicUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            {shop ? 'Edit Shop' : 'Create Your Shop'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Logo Upload */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden relative">
            {logoPreview ? (
              <>
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview('');
                    setFormData(prev => ({ ...prev, logo_url: '' }));
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <Upload className="h-8 w-8 text-primary/50 mb-1" />
                <span className="text-xs text-muted-foreground">Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Shop Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your shop name"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your shop and what you sell..."
            rows={3}
          />
        </div>

        {/* Trading Center */}
        <div className="space-y-2">
          <Label htmlFor="trading_center">Trading Center / Market Location</Label>
          <Input
            id="trading_center"
            value={formData.trading_center}
            onChange={(e) => setFormData(prev => ({ ...prev, trading_center: e.target.value }))}
            placeholder="e.g., Nyabugogo Market, Kimironko Market"
          />
        </div>

        {/* Contact Info (Auto-filled) */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <h3 className="font-medium text-sm">Contact Information (from your profile)</h3>
          <p className="text-sm text-muted-foreground">
            📞 Call: {profile?.call_number || 'Not set'}
          </p>
          <p className="text-sm text-muted-foreground">
            💬 WhatsApp: {profile?.whatsapp_number || 'Not set'}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : (shop ? 'Update Shop' : 'Create Shop')}
        </Button>
      </form>
    </div>
  );
};

export default ShopForm;
