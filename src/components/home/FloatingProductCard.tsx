import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingProductCardProps {
  id: string;
  slug?: string;
  title: string;
  price: number;
  images: string[];
}

const FloatingProductCard = ({
  id,
  slug,
  title,
  price,
  images,
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
    // Use slug if available, otherwise fall back to id
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
        "hover:-translate-y-1"
      )}
    >
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
        {/* Product Name */}
        <h3 
          className="font-semibold text-foreground text-sm leading-tight line-clamp-2"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
        >
          {title}
        </h3>

        {/* Product Price */}
        <p className="font-bold text-base text-primary">
          Fr {formatPrice(price)}
        </p>
      </div>
    </div>
  );
};

export default FloatingProductCard;
