import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: string | null;
  location: string | null;
  location_id: string | null;
  video_url: string | null;
  is_negotiable: boolean | null;
  product_type: string | null;
  status: string | null;
  views: number | null;
  likes: number | null;
  seller_id: string;
  shop_id: string | null;
  contact_whatsapp: string | null;
  contact_call: string | null;
  created_at: string | null;
  slug: string | null;
  // Admin & Rental fields
  admin_posted: boolean | null;
  admin_phone: string | null;
  admin_location: string | null;
  show_connect_button: boolean | null;
  sponsored: boolean | null;
  last_edited_by: string | null;
  rental_fee: number | null;
  rental_unit: string | null;
  rental_status: string | null;
  seller?: {
    id: string;
    full_name: string;
    profile_image: string | null;
    whatsapp_number: string | null;
    call_number: string | null;
  } | null;
  shop?: {
    id: string;
    name: string;
    logo_url: string | null;
    trading_center: string | null;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  type: string;
}

export const useProducts = (categoryType?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [categoryType, profile?.sector_id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(id, full_name, profile_image, whatsapp_number, call_number),
          shop:shops(id, name, logo_url, trading_center)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Filter by category type if provided
      if (categoryType) {
        const { data: categories } = await supabase
          .from('categories')
          .select('slug')
          .eq('type', categoryType);
        
        if (categories && categories.length > 0) {
          const categorySlugs = categories.map(c => c.slug);
          query = query.in('category', categorySlugs);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) {
      setLoading(false);
      setError('No product ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey(id, full_name, profile_image, whatsapp_number, call_number),
          shop:shops(id, name, logo_url, trading_center)
        `)
        .eq('id', productId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching product:', fetchError);
        setError(fetchError.message);
        setProduct(null);
        return;
      }
      
      if (!data) {
        setError('Product not found');
        setProduct(null);
        return;
      }
      
      // Increment view count (ignore errors - non-critical)
      try {
        await supabase.rpc('increment_product_view', { product_uuid: productId });
      } catch {
        // Ignore view count errors
      }
      
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
};

export const useCategories = (type?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      let query = supabase.from('categories').select('*').order('name');
      if (type) {
        query = query.eq('type', type);
      }
      const { data } = await query;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading };
};

export const useMyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [user]);

  const fetchMyProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(id, name, logo_url, trading_center)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, refetch: fetchMyProducts };
};

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', user.id);

      setFavorites(data?.map(f => f.product_id) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;

    const isFavorite = favorites.includes(productId);
    
    if (isFavorite) {
      await supabase
        .from('product_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      setFavorites(prev => prev.filter(id => id !== productId));
    } else {
      await supabase
        .from('product_likes')
        .insert({ user_id: user.id, product_id: productId });
      setFavorites(prev => [...prev, productId]);
    }
  };

  return { favorites, loading, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) };
};
