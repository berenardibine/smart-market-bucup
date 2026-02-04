import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Heart, MessageCircle, Phone, Share2, 
  MapPin, Store, ShieldCheck, ChevronLeft, ChevronRight,
  Package, Tag, Home, Loader2, Flag, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useProductBySlug } from "@/hooks/useProductBySlug";
import { useLinkAnalytics } from "@/hooks/useLinkAnalytics";
import { useProductViewTracking } from "@/hooks/useProductTracking";
import ProductMetaTags from "@/components/seo/ProductMetaTags";
import ImageLightbox from "@/components/ui/image-lightbox";
import ReportModal from "@/components/products/ReportModal";
import ProductComments from "@/components/products/ProductComments";
import AIRecommendations from "@/components/products/AIRecommendations";
import { cn } from "@/lib/utils";

// Loading Component
const ProductLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
    <p className="text-muted-foreground">Loading product details...</p>
  </div>
);

// Not Found Component
const ProductNotFound = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Package className="h-10 w-10 text-primary/60" />
      </div>
      <h1 className="text-3xl font-bold text-primary mb-2">Product Not Found 😊</h1>
      <p className="text-muted-foreground mb-6">
        This product may have been removed or is no longer available.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link to="/">
          <Home className="h-5 w-5" />
          Browse Products
        </Link>
      </Button>
    </div>
  </div>
);

const ProductDetail = () => {
  const { slugOrId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { product, loading, error, isSlugBased } = useProductBySlug(slugOrId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Determine ref source from URL params or default to 'direct'
  const refSource = searchParams.get('ref') || 'direct';

  // Track link analytics (existing)
  useLinkAnalytics(product?.id);

  // Track product view (new impressions/views system)
  useProductViewTracking(product?.id, refSource);

  // Redirect old ID-based URLs to slug-based URLs
  useEffect(() => {
    if (product?.slug && !isSlugBased && slugOrId !== product.slug) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [product?.slug, isSlugBased, slugOrId, navigate]);

  // Handle invalid ID early
  if (!slugOrId) {
    return <ProductNotFound />;
  }

  // Generate product URLs for sharing
  const productSlugOrId = product?.slug || product?.id;
  const shareableUrl = productSlugOrId 
    ? `https://smart-market-online.vercel.app/p/${productSlugOrId}`
    : window.location.href;
  const productUrl = product?.slug 
    ? `https://smart-market-online.vercel.app/product/${product.slug}`
    : window.location.href;

  const handleWhatsApp = () => {
    const phone = product?.contact_whatsapp || product?.seller?.whatsapp_number;
    if (phone) {
      const message = encodeURIComponent(`Hello! I'm interested in your product on Smart Market: ${shareableUrl}`);
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          text: `Check out this product: ${product?.title}`,
          url: shareableUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareableUrl);
        toast({ title: "Link copied to clipboard! 🔗" });
      }
    } catch (err) {
      console.log("Share cancelled");
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state
  if (loading) {
    return <ProductLoader />;
  }

  // Show not found if product doesn't exist or there was an error
  if (!product || error) {
    return <ProductNotFound />;
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.svg'];
  const favorite = isFavorite(product.id);

  return (
    <>
      {/* SEO Meta Tags */}
      <ProductMetaTags
        title={product.title}
        description={product.description}
        image={images[0]}
        url={productUrl}
        price={product.price}
      />
      
      {/* Fullscreen Image Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={currentImage}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      
      <div className="min-h-screen bg-background pb-8">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
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
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Heart className={cn("h-5 w-5", favorite && "fill-current")} />
              </button>
            </div>
          </div>
        </div>

        {/* Image Carousel - No zoom, click opens lightbox */}
        <div className="relative bg-background">
          <div 
            className="aspect-square relative overflow-hidden cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <img 
              src={images[currentImage]} 
              alt={product.title}
              className="w-full h-full object-contain bg-white"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }}
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
            
            {/* Tap to view hint */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              Tap to view full screen
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-background">
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
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
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
          {/* Title & Price with Negotiable display */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
              {product.is_negotiable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0 cursor-help">
                        <Tag className="h-3 w-3 mr-1" />
                        Negotiable
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Contact seller to negotiate the price</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-2">
              {product.is_negotiable && product.price > 0 ? (
                <p className="text-2xl font-bold text-primary">
                  From {formatPrice(product.price)}
                  <span className="text-base font-medium text-muted-foreground ml-2">(Negotiable)</span>
                  {product.rental_unit && (
                    <span className="text-lg font-medium text-muted-foreground">/{product.rental_unit}</span>
                  )}
                </p>
              ) : product.is_negotiable ? (
                <p className="text-2xl font-bold text-primary">Price Negotiable</p>
              ) : product.price > 0 ? (
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                  {product.rental_unit && (
                    <span className="text-lg font-medium text-muted-foreground">/{product.rental_unit}</span>
                  )}
                </p>
              ) : (
                <p className="text-2xl font-bold text-primary">Price Negotiable</p>
              )}
            </div>
            {product.admin_posted && (
              <Badge className="mt-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                ✓ Official Smart Market Listing
              </Badge>
            )}
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-3">
            {product.quantity && product.quantity > 0 && (
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
            {product.category && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/10 text-secondary">
                <span className="text-sm capitalize">{product.category.replace(/-/g, ' ')}</span>
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
                  <Store className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {product.shop?.name || product.seller?.full_name || 'Seller'}
                  </h4>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                {product.shop?.trading_center && (
                  <p className="text-sm text-muted-foreground">
                    {product.shop.trading_center}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Buttons Section */}
          <div className="bg-background rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold mb-3 text-foreground">Contact Seller</h3>
            
            {/* Call Seller Button */}
            <Button
              onClick={handleCall}
              variant="outline"
              size="lg"
              className="w-full gap-3 h-14 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-soft"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-semibold text-foreground">Call Seller</span>
            </Button>

            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsApp}
              size="lg"
              className="w-full gap-3 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition-all duration-300 shadow-soft hover:shadow-elevated"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="flex-1 text-left font-semibold">Contact Seller on WhatsApp</span>
            </Button>

            {/* Secure contact label */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              🔒 Secure contact powered by Smart Market
            </p>
          </div>

          {/* Report Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="text-muted-foreground hover:text-destructive gap-2"
            >
              <Flag className="h-4 w-4" />
              Report product or seller — help us keep Smart Market safe
            </Button>
          </div>

          {/* Comments Section */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <ProductComments productId={product.id} />
          </div>

          {/* AI Recommendations */}
          <div className="pt-4">
            <AIRecommendations productId={product.id} />
          </div>
        </div>

        {/* Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          productId={product.id}
          sellerId={product.seller?.id}
          productTitle={product.title}
          sellerName={product.shop?.name || product.seller?.full_name}
        />
      </div>
    </>
  );
};

export default ProductDetail;
