import { useState } from "react";
import { X, Search, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const recentSearches = ["Fresh tomatoes", "Toyota Corolla", "Rice farm tools"];
const trendingSearches = ["Coffee beans", "Motorcycles", "Land for sale", "Banana plantation"];

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, shops, categories..."
              className="pl-10 bg-muted border-0 focus-visible:ring-primary"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Recent</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    className="px-3 py-1.5 rounded-full bg-muted text-sm text-foreground hover:bg-accent transition-colors tap-highlight-none"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Trending</span>
            </div>
            <div className="space-y-1">
              {trendingSearches.map((search, index) => (
                <button
                  key={search}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors tap-highlight-none"
                >
                  <span className="text-sm font-semibold text-primary w-5">{index + 1}</span>
                  <span className="text-foreground">{search}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
