import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BoostedProduct {
  id: string;
  product_id: string;
  seller_id: string;
  amount: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  product?: any;
}

export const useBoostedProducts = () => {
  const [boosts, setBoosts] = useState<BoostedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveBoosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boosted_products')
        .select('*, product:products(id, title, images, price, slug, category, rental_unit, is_negotiable, sponsored)')
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoosts((data || []) as BoostedProduct[]);
    } catch (err) {
      console.error('Error fetching boosted products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBoosts();
  }, [fetchActiveBoosts]);

  return { boosts, loading, refetch: fetchActiveBoosts };
};

export const useSellerBoosts = () => {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState<BoostedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBoosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boosted_products')
        .select('*, product:products(id, title, images, price)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoosts((data || []) as BoostedProduct[]);
    } catch (err) {
      console.error('Error fetching seller boosts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyBoosts();
  }, [fetchMyBoosts]);

  const requestBoost = async (productId: string, durationDays: number) => {
    if (!user) throw new Error('Must be logged in');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const { error } = await supabase.from('boosted_products').insert({
      product_id: productId,
      seller_id: user.id,
      duration_days: durationDays,
      end_date: endDate.toISOString(),
      status: 'pending',
    });
    if (error) throw error;
    await fetchMyBoosts();
  };

  return { boosts, loading, requestBoost, refetch: fetchMyBoosts };
};

export const useAdminBoosts = () => {
  const [boosts, setBoosts] = useState<BoostedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBoosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boosted_products')
        .select('*, product:products(id, title, images, price), seller:profiles!boosted_products_seller_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoosts((data || []) as any[]);
    } catch (err) {
      console.error('Error fetching all boosts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBoosts();
  }, [fetchAllBoosts]);

  const updateBoostStatus = async (boostId: string, status: string, adminNotes?: string) => {
    const updateData: any = { status };
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (status === 'active') updateData.start_date = new Date().toISOString();

    const { error } = await supabase.from('boosted_products').update(updateData).eq('id', boostId);
    if (error) throw error;
    await fetchAllBoosts();
  };

  return { boosts, loading, updateBoostStatus, refetch: fetchAllBoosts };
};
