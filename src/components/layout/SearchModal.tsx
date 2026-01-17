import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, TrendingUp, Clock, Package, Store, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'product' | 'shop' | 'user';
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  slug?: string;
  price?: number;
}

const trendingSearches = ["Electronics", "Phones", "Vegetables", "Land for sale", "Motorcycles"];

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart-market-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('smart-market-recent-searches', JSON.stringify(updated));
  };

  // Debounced search
  const searchDatabase = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${searchQuery}%`;
      
      // Search products, shops, and users in parallel
      const [productsRes, shopsRes, usersRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, title, price, images, slug')
          .eq('status', 'active')
          .ilike('title', searchTerm)
          .limit(5),
        supabase
          .from('shops')
          .select('id, name, logo_url, trading_center')
          .eq('is_active', true)
          .ilike('name', searchTerm)
          .limit(3),
        supabase
          .from('profiles')
          .select('id, full_name, profile_image, business_name')
          .or(`full_name.ilike.${searchTerm},business_name.ilike.${searchTerm}`)
          .eq('status', 'active')
          .limit(3)
      ]);

      const searchResults: SearchResult[] = [];

      // Add products
      if (productsRes.data) {
        productsRes.data.forEach(p => {
          searchResults.push({
            type: 'product',
            id: p.id,
            title: p.title,
            subtitle: `Fr ${p.price?.toLocaleString() || 0}`,
            image: p.images?.[0],
            slug: p.slug,
            price: p.price
          });
        });
      }

      // Add shops
      if (shopsRes.data) {
        shopsRes.data.forEach(s => {
          searchResults.push({
            type: 'shop',
            id: s.id,
            title: s.name,
            subtitle: s.trading_center || 'Shop',
            image: s.logo_url || undefined
          });
        });
      }

      // Add users
      if (usersRes.data) {
        usersRes.data.forEach(u => {
          searchResults.push({
            type: 'user',
            id: u.id,
            title: u.full_name,
            subtitle: u.business_name || 'Member',
            image: u.profile_image || undefined
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDatabase(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchDatabase]);

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result.title);
    onClose();
    
    if (result.type === 'product') {
      navigate(`/product/${result.slug || result.id}`);
    } else if (result.type === 'shop') {
      // For now, navigate to a shop page (can be implemented later)
      navigate(`/?shop=${result.id}`);
    } else {
      // For now, navigate home (user profiles can be implemented later)
      navigate('/');
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'shop': return Store;
      case 'user': return User;
      default: return Package;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-primary/10 text-primary';
      case 'shop': return 'bg-blue-100 text-blue-600';
      case 'user': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

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
              placeholder="Search products, shops, sellers..."
              className="pl-10 bg-muted border-0 focus-visible:ring-primary"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Results</span>
              </div>
              <div className="space-y-2">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border hover:bg-accent/50 transition-colors text-left"
                    >
                      {result.image ? (
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={result.image} alt={result.title} className="object-cover" />
                          <AvatarFallback className={cn("rounded-lg", getIconColor(result.type))}>
                            <Icon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", getIconColor(result.type))}>
                          <Icon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded-full">
                        {result.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try different keywords</p>
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Recent</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleQuickSearch(search)}
                    className="px-3 py-1.5 rounded-full bg-muted text-sm text-foreground hover:bg-accent transition-colors tap-highlight-none"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          {query.length < 2 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Trending</span>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleQuickSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors tap-highlight-none"
                  >
                    <span className="text-sm font-semibold text-primary w-5">{index + 1}</span>
                    <span className="text-foreground">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;