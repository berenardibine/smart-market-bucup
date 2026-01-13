import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useAllProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts();
  }, [category]);

  const fetchAllProducts = async () => {
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

      // Filter by category if provided and not 'all'
      if (category && category !== 'all') {
        query = query.eq('category', category);
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

  return { products, loading, error, refetch: fetchAllProducts };
};
