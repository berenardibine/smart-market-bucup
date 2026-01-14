import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  type: string | null;
}

// Icon mapping for categories
const iconMap: Record<string, string> = {
  'Crops': '🌾',
  'Crops and harvests': '🌾',
  'Fertilizers': '🔥',
  'Fruits and vegetables': '🍊',
  'Crop medecine': '💫',
  'House': '🏠',
  'Land': '🗺️',
  'Real estates': '🏘️',
  'Vehicles': '🚗',
  'Big machine': '🔧',
  'Beauty and personal care': '💄',
  'Construction materials': '🏗️',
  'Education and stationary': '📚',
  'Electronics': '💻',
  'Fashion and clothing': '👕',
  'Food and beverages': '🍔',
  'Furniture and home decorations': '🛋️',
  'Health and fitness': '💪',
  'Kitchen and appliances': '🍳',
  'Office equipment': '🖥️',
  'Other': '❓',
  'Sports and interntainment': '⚽',
  'For lent construction materials': '🏗️',
  'For lent house and apartment': '🏠',
  'For lent tools and machinery': '🔧',
  'For lent vehicles': '🚗',
  'For lent Weeding and party decorations': '🎉',
};

export const useCategories = (type?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('categories')
        .select('id, name, slug, icon, type')
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process categories to add proper icons if needed
      const processedCategories = (data || []).map(cat => ({
        ...cat,
        icon: cat.icon || iconMap[cat.name] || '📦'
      }));

      setCategories(processedCategories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
};

// Hook to get categories grouped by type
export const useCategoriesByType = () => {
  const [categoriesByType, setCategoriesByType] = useState<Record<string, Category[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, icon, type')
        .order('name');

      if (data) {
        const grouped = data.reduce((acc, cat) => {
          const type = cat.type || 'general';
          if (!acc[type]) acc[type] = [];
          acc[type].push({
            ...cat,
            icon: cat.icon || iconMap[cat.name] || '📦'
          });
          return acc;
        }, {} as Record<string, Category[]>);
        setCategoriesByType(grouped);
      }
      setLoading(false);
    };

    fetchAll();
  }, []);

  return { categoriesByType, loading };
};
