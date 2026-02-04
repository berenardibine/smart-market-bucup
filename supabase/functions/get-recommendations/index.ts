import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const limit = parseInt(url.searchParams.get('limit') || '12', 10);
    const page = parseInt(url.searchParams.get('page') || '0', 10);

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'productId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have cached recommendations (less than 1 hour old)
    const { data: cached } = await supabase
      .from('recommendation_index')
      .select('recommended_ids, updated_at')
      .eq('product_id', productId)
      .single();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    if (cached && cached.updated_at > oneHourAgo) {
      // Use cached recommendations
      const recommendedIds = cached.recommended_ids as string[];
      const paginatedIds = recommendedIds.slice(page * limit, (page + 1) * limit);
      
      if (paginatedIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, title, price, images, category, rental_unit, sponsored, is_negotiable')
          .in('id', paginatedIds)
          .eq('status', 'active');

        return new Response(
          JSON.stringify({ 
            products: products || [], 
            hasMore: (page + 1) * limit < recommendedIds.length,
            total: recommendedIds.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate new recommendations
    // First, get the current product details
    const { data: currentProduct } = await supabase
      .from('products')
      .select('id, category, product_type, seller_id')
      .eq('id', productId)
      .single();

    if (!currentProduct) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strategy 1: Same category, different seller
    const { data: sameCategory } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active')
      .eq('category', currentProduct.category)
      .neq('id', productId)
      .neq('seller_id', currentProduct.seller_id)
      .limit(20);

    // Strategy 2: Same product type
    const { data: sameType } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active')
      .eq('product_type', currentProduct.product_type)
      .neq('id', productId)
      .limit(20);

    // Strategy 3: Same seller's other products
    const { data: sameSeller } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active')
      .eq('seller_id', currentProduct.seller_id)
      .neq('id', productId)
      .limit(10);

    // Combine and deduplicate
    const allIds = new Set<string>();
    sameCategory?.forEach(p => allIds.add(p.id));
    sameType?.forEach(p => allIds.add(p.id));
    sameSeller?.forEach(p => allIds.add(p.id));

    // If not enough, add random products
    if (allIds.size < 30) {
      const { data: random } = await supabase
        .from('products')
        .select('id')
        .eq('status', 'active')
        .neq('id', productId)
        .limit(50 - allIds.size);
      
      random?.forEach(p => allIds.add(p.id));
    }

    const recommendedIds = Array.from(allIds);

    // Cache the recommendations
    await supabase
      .from('recommendation_index')
      .upsert({
        product_id: productId,
        recommended_ids: recommendedIds,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id' });

    // Return paginated results
    const paginatedIds = recommendedIds.slice(page * limit, (page + 1) * limit);
    
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, images, category, rental_unit, sponsored, is_negotiable')
      .in('id', paginatedIds)
      .eq('status', 'active');

    return new Response(
      JSON.stringify({ 
        products: products || [], 
        hasMore: (page + 1) * limit < recommendedIds.length,
        total: recommendedIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
