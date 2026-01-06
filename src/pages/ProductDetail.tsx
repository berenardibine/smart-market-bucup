import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, MessageCircle, Phone, Bell, Share2, 
  MapPin, Store, ShieldCheck, ChevronLeft, ChevronRight,
  Package, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProduct, useFavorites } from "@/hooks/useProducts";
import { useSendRequest } from "@/hooks/useProductRequests";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { product, loading } = useProduct(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { sendRequest, sending } = useSendRequest();
  const [currentImage, setCurrentImage] = useState(0);

  const handleWhatsApp = () => {
    const phone = product?.contact_whatsapp || product?.seller?.whatsapp_number;
    if (phone) {
      const message = encodeURIComponent(`Hi! I'm interested in your product: ${product?.title}`);
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    } else {
      toast({ title: "WhatsApp not available", variant: "destructive" });
    }
  };

  const handleCall = () => {
    const phone = product?.contact_call || product?.seller?.call_number;
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      toast({ title: "Phone number not available", variant: "destructive" });
    }
  };

  const handleRequest = async () => {
    if (!user) {
      toast({ 
        title: "Please sign in", 
        description: "You need to be logged in to request a product",
        variant: "destructive" 
      });
      navigate('/auth');
      return;
    }

    if (!product) return;

    try {
      await sendRequest(product.id, product.seller_id);
      toast({ 
        title: "🎉 Request sent!", 
        description: "Seller will contact you soon." 
      });
    } catch (err: any) {
      toast({ 
        title: "Request failed", 
        description: err.message,
        variant: "destructive" 
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.title,
        text: `Check out this product: ${product?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <Skeleton className="w-full aspect-square" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const images = product.images || ['/placeholder.svg'];
  const favorite = isFavorite(product.id);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg line-clamp-1 flex-1 mx-4">Product Details</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => toggleFavorite(product.id)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                favorite 
                  ? "bg-primary text-white" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <Heart className={cn("h-5 w-5", favorite && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative bg-gradient-to-br from-muted to-muted/50">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={images[currentImage]} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentImage 
                        ? "bg-primary w-6" 
                        : "bg-white/60 hover:bg-white"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={cn(
                  "w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                  idx === currentImage 
                    ? "border-primary shadow-lg shadow-primary/30" 
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Player */}
      {product.video_url && (
        <div className="p-4">
          <video 
            src={product.video_url} 
            controls 
            className="w-full rounded-xl"
            poster={images[0]}
          />
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
            {product.is_negotiable && (
              <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
                <Tag className="h-3 w-3 mr-1" />
                Negotiable
              </Badge>
            )}
          </div>
          <p className="text-3xl font-bold text-primary mt-2">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3">
          {product.quantity && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{product.quantity} available</span>
            </div>
          )}
          {product.location && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{product.location}</span>
            </div>
          )}
          {product.product_type && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted">
              <span className="text-sm capitalize">{product.product_type}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-muted/50 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Seller Info */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Seller Information
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {product.shop?.logo_url || product.seller?.profile_image ? (
                <img 
                  src={product.shop?.logo_url || product.seller?.profile_image || ''} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {product.shop?.name || product.seller?.full_name}
                </h4>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </div>
              {product.shop?.trading_center && (
                <p className="text-sm text-muted-foreground">
                  {product.shop.trading_center}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCall}
            className="flex-1 gap-2 border-2 hover:border-primary hover:text-primary"
          >
            <Phone className="h-5 w-5" />
            Call
          </Button>
          <Button
            size="lg"
            onClick={handleWhatsApp}
            className="flex-1 gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Button>
          <Button
            size="lg"
            onClick={handleRequest}
            disabled={sending}
            className="flex-1 gap-2 bg-gradient-to-r from-primary via-primary to-amber-500 hover:opacity-90"
          >
            <Bell className="h-5 w-5" />
            {sending ? "Sending..." : "I Need This"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
