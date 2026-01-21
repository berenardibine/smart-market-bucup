import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

interface FloatingProductCardProps {
  id: string;
  slug?: string;
  title: string;
  price: number;
  images: string[];
  rentalUnit?: string | null;
  isSponsored?: boolean | null;
}

const FloatingProductCard = ({
  id,
  slug,
  title,
  price,
  images,
  rentalUnit,
  isSponsored,
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
    navigate(`/product/${slug || id}`);
  };

  const productImage = images?.[0] || '/placeholder.svg';

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative bg-background rounded-2xl overflow-hidden cursor-pointer",
        "border-none p-3 md:p-4",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        isSponsored && "ring-2 ring-primary/30"
      )}
    >
      {/* Sponsored Badge */}
      {isSponsored && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          <Crown className="h-3 w-3" />
          Featured
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-xl bg-background">
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
            mixBlendMode: 'multiply',
            backgroundColor: 'white'
          }}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        <h3 
          className="font-semibold text-foreground text-sm leading-tight line-clamp-2"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
        >
          {title}
        </h3>

        {/* Price with rental unit */}
        <p className="font-bold text-base text-primary">
          Fr {formatPrice(price)}
          {rentalUnit && <span className="text-xs font-medium text-muted-foreground">/{rentalUnit}</span>}
        </p>
      </div>
    </div>
  );
};

export default FloatingProductCard;
