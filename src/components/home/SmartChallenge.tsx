import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SmartChallenge = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-secondary p-4 shadow-blue">
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
        <Trophy className="h-6 w-6 text-secondary-foreground/80" />
      </div>
      
      <div className="relative pr-12">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-secondary-foreground text-2xs font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground animate-pulse" />
          Active Challenge
        </div>
        <h3 className="text-secondary-foreground font-bold mb-1">
          Listing Challenge 🏆
        </h3>
        <p className="text-secondary-foreground/90 text-sm mb-3">
          List 5 products today and get extra visibility for your shop!
        </p>
        <Button variant="cream" size="sm" className="gap-1">
          Join Challenge
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default SmartChallenge;
