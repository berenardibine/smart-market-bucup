import { useState } from "react";
import { Heart, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useProducts";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  location?: string | null;
  is_negotiable?: boolean | null;
  quantity?: number;
  category?: string | null;
  compact?: boolean;
}

const ProductCard = ({ 
  id, 
  title, 
  price, 
  images, 
  location, 
  is_negotiable,
  quantity,
  compact = false
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isFavorite(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const imageUrl = images?.[0] || '/placeholder.svg';

  return (
    <div 
      onClick={() => navigate(`/product/${id}`)}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden cursor-pointer",
        "shadow-soft border border-border/30",
        "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02]",
        "transition-all duration-300 ease-out"
      )}
    >
      {/* Image */}
      <div className={cn(
        "relative overflow-hidden bg-gradient-to-br from-muted to-muted/50",
        compact ? "aspect-square" : "aspect-[4/3]"
      )}>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center",
            "backdrop-blur-sm transition-all duration-200 tap-highlight-none",
            favorite 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40" 
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-primary"
          )}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all",
              favorite && "fill-current",
              isAnimating && "animate-heart-pop"
            )} 
          />
        </button>

        {/* Negotiable Badge */}
        {is_negotiable && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" />
              Negotiable
            </span>
          </div>
        )}

        {/* Quantity Badge */}
        {quantity !== undefined && quantity > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white">
              {quantity} available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="font-bold text-primary text-base mb-1.5">
          {formatPrice(price)}
        </p>
        {location && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary/70" />
            <span className="text-xs line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
