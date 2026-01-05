import { MapPin, Star } from "lucide-react";

interface ShopCardProps {
  id: string;
  name: string;
  logo: string;
  location: string;
  distance: string;
  rating?: number;
}

const ShopCard = ({ name, logo, location, distance, rating = 4.5 }: ShopCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-2xl shadow-soft card-hover border border-border/50">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
        <img 
          src={logo} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="text-2xs line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="text-2xs font-medium text-foreground">{rating}</span>
          </div>
          <span className="text-2xs text-muted-foreground">• {distance}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
