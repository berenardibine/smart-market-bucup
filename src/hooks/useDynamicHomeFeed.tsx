import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string | null;
  created_at: string | null;
  views: number | null;
  likes: number | null;
  rental_unit: string | null;
  sponsored: boolean | null;
  product_type: string | null;
  country: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  is_negotiable: boolean | null;
  admin_posted: boolean | null;
  seller?: {
    id: string;
    full_name: string;
    profile_image: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  type: string | null;
}

interface CategorySection {
  category: Category;
  products: Product[];
  color: string;
}

// Category color gradients
const categoryColors = [
  'from-orange-500 to-amber-400',
  'from-green-500 to-emerald-400',
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-violet-400',
  'from-pink-500 to-rose-400',
  'from-teal-500 to-green-400',
  'from-indigo-500 to-blue-400',
  'from-red-500 to-orange-400',
];

// Icon mapping
const iconMap: Record<string, string> = {
  'asset': '🏠',
  'agriculture': '🌾',
  'rent': '🔧',
  'electronics': '💻',
  'fashion': '👕',
  'food': '🍔',
  'health': '💪',
  'furniture': '🛋️',
  'default': '📦',
};

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Cache key
const SHUFFLE_CACHE_KEY = 'home_feed_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useDynamicHomeFeed = (userCountry?: string | null) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const hasShuffledRef = useRef(false);

  // Check cache validity
  const isCacheValid = useMemo(() => {
    const cached = sessionStorage.getItem(SHUFFLE_CACHE_KEY);
    if (cached) {
      const timestamp = parseInt(cached, 10);
      return Date.now() - timestamp < CACHE_DURATION;
    }
    return false;
  }, []);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      fetchData();
    } else {
      // Don't show loading skeleton on country change refetch
      fetchDataSilent();
    }
  }, [userCountry]);

  const fetchDataSilent = async () => {
    try {
      await fetchDataInternal(false);
    } catch (error) {
      console.error('Error fetching home feed:', error);
    }
  };

  const fetchData = async () => {
    try {
      await fetchDataInternal(true);
    } catch (error) {
      console.error('Error fetching home feed:', error);
    }
  };

  const fetchDataInternal = async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    isInitialLoad.current = false;
    try {
      let productsQuery = supabase
        .from('products')
        .select(`
          id, title, price, images, category, created_at, views, likes, 
          rental_unit, sponsored, product_type, country, currency_code, 
          currency_symbol, is_negotiable, admin_posted,
          seller:profiles!products_seller_id_fkey(id, full_name, profile_image)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (userCountry) {
        productsQuery = productsQuery.eq('country', userCountry);
      }

      const [productsRes, categoriesRes] = await Promise.all([
        productsQuery,
        supabase
          .from('categories')
          .select('id, name, slug, icon, type')
          .order('name')
      ]);

      const products = (productsRes.data || []) as Product[];
      const cats = (categoriesRes.data || []) as Category[];

      setCategories(cats);

      if (!hasShuffledRef.current || !isCacheValid) {
        const shuffled = shuffleArray(products);
        setAllProducts(shuffled);
        hasShuffledRef.current = true;
        sessionStorage.setItem(SHUFFLE_CACHE_KEY, Date.now().toString());
      } else {
        setAllProducts(products);
      }

      const sections: CategorySection[] = [];
      const categoriesWithProducts = cats.filter(cat => 
        products.some(p => p.category === cat.slug)
      );

      const shuffledCats = shuffleArray(categoriesWithProducts);

      shuffledCats.forEach((cat, index) => {
        const categoryProducts = products
          .filter(p => p.category === cat.slug)
          .slice(0, 12);
        
        if (categoryProducts.length >= 1) {
          sections.push({
            category: {
              ...cat,
              icon: cat.icon || iconMap[cat.type || 'default'] || iconMap['default']
            },
            products: categoryProducts,
            color: categoryColors[index % categoryColors.length]
          });
        }
      });

      setCategorySections(sections);
    } finally {
      setLoading(false);
    }
  };

  // Build the dynamic feed: random products interspersed with category sections
  const dynamicFeed = useMemo(() => {
    const feed: Array<{ type: 'products' | 'category'; data: Product[] | CategorySection }> = [];
    const groupSize = 6;
    
    // Split random products into groups
    const productGroups: Product[][] = [];
    for (let i = 0; i < allProducts.length; i += groupSize) {
      productGroups.push(allProducts.slice(i, i + groupSize));
    }

    // Interleave product groups with category sections
    let categoryIndex = 0;
    productGroups.forEach((group, index) => {
      // Add product group
      feed.push({ type: 'products', data: group });
      
      // After each group, insert a category section if available
      if (categoryIndex < categorySections.length && index < productGroups.length - 1) {
        feed.push({ type: 'category', data: categorySections[categoryIndex] });
        categoryIndex++;
      }
    });

    return feed;
  }, [allProducts, categorySections]);

  // Specialized sections
  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);
  }, [allProducts]);

  const assetProducts = useMemo(() => {
    return allProducts.filter(p => p.product_type === 'asset').slice(0, 8);
  }, [allProducts]);

  const agricultureProducts = useMemo(() => {
    return allProducts.filter(p => p.product_type === 'agriculture').slice(0, 8);
  }, [allProducts]);

  const rentProducts = useMemo(() => {
    return allProducts.filter(p => p.product_type === 'rent').slice(0, 8);
  }, [allProducts]);

  return {
    allProducts,
    categories,
    categorySections,
    dynamicFeed,
    newArrivals,
    assetProducts,
    agricultureProducts,
    rentProducts,
    loading,
    refetch: fetchData
  };
};

export default useDynamicHomeFeed;
