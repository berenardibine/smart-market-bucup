import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  rating?: number;
}

const FloatingProductCard = ({
  id,
  title,
  price,
  images,
  rating = 0,
}: FloatingProductCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleClick = () => {
    navigate(`/product/${id}`);
  };

  const productImage = images?.[0] || '/placeholder.svg';

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden cursor-pointer",
        "border-none p-3 md:p-4",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        // Soft drop shadow
        "shadow-[0_6px_12px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-xl bg-white">
        {/* Subtle shadow below image for floating feel */}
        <div className="absolute inset-x-4 bottom-0 h-4 bg-gradient-to-t from-black/5 to-transparent rounded-b-xl z-10" />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
        )}
        
        <img
          src={productImage}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-contain max-h-[220px] mx-auto",
            "transition-all duration-300",
            "group-hover:scale-105",
            !imageLoaded && "opacity-0"
          )}
          style={{ 
            mixBlendMode: 'multiply', // Blend with white background
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        {/* Product Name */}
        <h3 
          className="font-semibold text-foreground text-sm leading-tight line-clamp-2"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
        >
          {title}
        </h3>

        {/* Product Price */}
        <p 
          className="font-bold text-base"
          style={{ color: '#FF7B00' }}
        >
          Fr {formatPrice(price)}
        </p>

        {/* Rating Stars (subtle) */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3 w-3 transition-colors",
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-gray-300 stroke-1"
              )}
            />
          ))}
          {rating > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              ({rating.toFixed(1)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingProductCard;
