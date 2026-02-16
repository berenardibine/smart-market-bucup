import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  invalidReferrals: number;
  totalRewards: number;
}

interface Referral {
  id: string;
  referrer_id: string | null;
  referred_user_id: string | null;
  referral_code: string;
  status: string | null;
  created_at: string | null;
  activated_at: string | null;
  invalid_reason: string | null;
  is_valid: boolean | null;
  referee_products_count: number | null;
  referee_account_age_days: number | null;
  referee?: { full_name: string; profile_image: string | null } | null;
}

export const useReferral = () => {
  const { user, profile } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0, activeReferrals: 0, pendingReferrals: 0,
    invalidReferrals: 0, totalRewards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      setReferralCode((profile as any).referral_code || null);
      fetchReferrals();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const fetchReferrals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const refs = (data || []) as Referral[];
      setReferrals(refs);

      setStats({
        totalReferrals: refs.length,
        activeReferrals: refs.filter(r => r.status === 'active').length,
        pendingReferrals: refs.filter(r => r.status === 'pending').length,
        invalidReferrals: refs.filter(r => r.status === 'invalid').length,
        totalRewards: 0,
      });
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = useCallback(() => {
    if (!referralCode) return '';
    return `${window.location.origin}/r/${referralCode}`;
  }, [referralCode]);

  const trackShare = async (channel: string) => {
    if (!user || !referralCode) return;
    try {
      await supabase.from('referral_shares').insert({
        user_id: user.id,
        referral_code: referralCode,
        channel,
        share_url: getShareUrl(),
      });
    } catch (err) {
      console.error('Error tracking share:', err);
    }
  };

  const validateCode = async (code: string): Promise<{ valid: boolean; referrerName?: string; error?: string }> => {
    try {
      // Check in profiles first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, referral_code')
        .eq('referral_code', code)
        .maybeSingle();

      if (profileData) {
        // Check user isn't referring themselves
        if (user && profileData.id === user.id) {
          return { valid: false, error: 'You cannot use your own referral code' };
        }
        return { valid: true, referrerName: profileData.full_name };
      }

      return { valid: false, error: 'Invalid referral code' };
    } catch {
      return { valid: false, error: 'Error validating code' };
    }
  };

  const applyReferralCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };

    // Check if already referred
    if ((profile as any)?.referred_by) {
      return { success: false, error: 'You already have a referral code applied' };
    }

    const validation = await validateCode(code);
    if (!validation.valid) return { success: false, error: validation.error };

    try {
      // Get referrer profile
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!referrer) return { success: false, error: 'Referrer not found' };

      // Create referral record
      const { error: refError } = await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        referral_code: code,
        status: 'pending',
        is_valid: true,
      });

      if (refError) throw refError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ referred_by: code })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to apply referral code' };
    }
  };

  return {
    referralCode,
    referrals,
    stats,
    loading,
    getShareUrl,
    trackShare,
    validateCode,
    applyReferralCode,
    refetch: fetchReferrals,
  };
};

// Hook to get session referral code from URL
export const useSessionReferral = () => {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('sm-referral-code');
    const storedName = sessionStorage.getItem('sm-referrer-name');
    if (stored) {
      setSessionCode(stored);
      setReferrerName(storedName);
    }
  }, []);

  const setReferral = (code: string, name?: string) => {
    sessionStorage.setItem('sm-referral-code', code);
    if (name) sessionStorage.setItem('sm-referrer-name', name);
    setSessionCode(code);
    setReferrerName(name || null);
  };

  const clearReferral = () => {
    sessionStorage.removeItem('sm-referral-code');
    sessionStorage.removeItem('sm-referrer-name');
    setSessionCode(null);
    setReferrerName(null);
  };

  return { sessionCode, referrerName, setReferral, clearReferral };
};

// Hook for featured products
export const useFeaturedProducts = (userCountry?: string | null) => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, [userCountry]);

  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const { data: featured } = await supabase
        .from('featured_products')
        .select('*, product:products!featured_products_product_id_fkey(id, title, price, images, category, currency_symbol, rental_unit, sponsored, is_negotiable, admin_posted, country, slug)')
        .eq('is_active', true)
        .gt('end_at', new Date().toISOString())
        .order('start_at', { ascending: false })
        .limit(12);

      if (featured) {
        let products = featured
          .map((f: any) => ({ ...f.product, featured_end: f.end_at, featured_reason: f.reason }))
          .filter((p: any) => p?.id);

        // Filter by country if specified
        if (userCountry) {
          products = products.filter((p: any) => p.country === userCountry || !p.country);
        }

        setFeaturedProducts(products);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { featuredProducts, loading, refetch: fetchFeatured };
};

// Admin referral analytics hook
export const useAdminReferrals = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [invalidReferrals, setInvalidReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, pending: 0, invalid: 0, featuredCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [refsRes, invalidRes, featuredRes] = await Promise.all([
        supabase.from('referrals').select('*, referrer:profiles!referrals_referrer_id_fkey(full_name, profile_image), referee:profiles!referrals_referred_user_id_fkey(full_name, profile_image)').order('created_at', { ascending: false }).limit(200),
        supabase.from('invalid_referrals').select('*').eq('reviewed', false).order('created_at', { ascending: false }).limit(50),
        supabase.from('featured_products').select('id', { count: 'exact', head: true }).eq('is_active', true).gt('end_at', new Date().toISOString()),
      ]);

      const refs = refsRes.data || [];
      setReferrals(refs);
      setInvalidReferrals(invalidRes.data || []);

      setStats({
        total: refs.length,
        active: refs.filter((r: any) => r.status === 'active').length,
        pending: refs.filter((r: any) => r.status === 'pending').length,
        invalid: refs.filter((r: any) => r.status === 'invalid').length,
        featuredCount: featuredRes.count || 0,
      });
    } catch (err) {
      console.error('Error fetching admin referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (id: string, status: string, reason?: string) => {
    try {
      const update: any = { status };
      if (status === 'active') update.activated_at = new Date().toISOString();
      if (status === 'invalid') update.invalid_reason = reason;
      
      await supabase.from('referrals').update(update).eq('id', id);
      await fetchAll();
    } catch (err) {
      console.error('Error updating referral:', err);
    }
  };

  const reviewInvalidReferral = async (id: string, action: string) => {
    try {
      await supabase.from('invalid_referrals').update({
        reviewed: true,
        reviewed_at: new Date().toISOString(),
        review_action: action,
      }).eq('id', id);
      await fetchAll();
    } catch (err) {
      console.error('Error reviewing invalid referral:', err);
    }
  };

  const addFeaturedProduct = async (productId: string, days: number, reason: string, referrerId?: string) => {
    try {
      const endAt = new Date();
      endAt.setDate(endAt.getDate() + days);
      
      await supabase.from('featured_products').insert({
        product_id: productId,
        referrer_id: referrerId || null,
        issued_by: referrerId ? 'referral' : 'admin',
        reason,
        end_at: endAt.toISOString(),
      });
      await fetchAll();
    } catch (err) {
      console.error('Error adding featured product:', err);
    }
  };

  const removeFeaturedProduct = async (id: string) => {
    try {
      await supabase.from('featured_products').update({ is_active: false }).eq('id', id);
      await fetchAll();
    } catch (err) {
      console.error('Error removing featured product:', err);
    }
  };

  return {
    referrals, invalidReferrals, stats, loading,
    updateReferralStatus, reviewInvalidReferral,
    addFeaturedProduct, removeFeaturedProduct,
    refetch: fetchAll,
  };
};
