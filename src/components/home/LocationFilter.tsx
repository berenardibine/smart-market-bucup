import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationFilter = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-accent/50 rounded-2xl">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <MapPin className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <Button variant="cream" size="sm" className="shrink-0 gap-1">
          <span className="text-xs">Western</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        <span className="text-muted-foreground">→</span>
        <Button variant="cream" size="sm" className="shrink-0 gap-1">
          <span className="text-xs">Rubavu</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        <span className="text-muted-foreground">→</span>
        <Button variant="soft" size="sm" className="shrink-0 gap-1 font-semibold">
          <span className="text-xs">Kivu Sector</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default LocationFilter;
