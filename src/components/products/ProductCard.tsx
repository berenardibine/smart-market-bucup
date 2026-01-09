import { useState } from "react";
import { Heart, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useProducts";
import { useAuth, useAuthAction } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const { withAuth } = useAuthAction();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isFavorite(id);

  const handleClick = () => {
    // Redirect guests to auth page
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/product/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    withAuth(() => {
      setIsAnimating(true);
      toggleFavorite(id);
      setTimeout(() => setIsAnimating(false), 300);
    });
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
      onClick={handleClick}
      className={cn(
        "group relative bg-white rounded-xl overflow-hidden cursor-pointer",
        "border border-orange-100 shadow-sm",
        "hover:shadow-orange hover:border-orange-200 hover:scale-[1.02]",
        "transition-all duration-300 ease-out"
      )}
    >
      {/* Image */}
      <div className={cn(
        "relative overflow-hidden bg-orange-50",
        compact ? "aspect-square" : "aspect-[4/3]"
      )}>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center",
            "backdrop-blur-sm transition-all duration-200 tap-highlight-none",
            favorite 
              ? "bg-primary text-white shadow-orange" 
              : "bg-white/90 text-gray-400 hover:bg-white hover:text-primary"
          )}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all",
              favorite && "fill-current",
              isAnimating && "animate-bounce-subtle"
            )} 
          />
        </button>

        {/* Negotiable Badge */}
        {is_negotiable && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary backdrop-blur-sm">
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
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="font-bold text-primary text-base mb-1.5">
          {formatPrice(price)}
        </p>
        {location && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-xs line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
