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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tbykrulfzhhkmtgjhvjh.supabase.co';
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { action } = await req.json();

    const results: Record<string, number> = {};

    // 1. New Product Alerts - notify users about new products in their area
    if (!action || action === 'new_products') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: newProducts } = await supabase
        .from('products')
        .select('id, title, country, category, seller_id')
        .gte('created_at', oneHourAgo)
        .eq('status', 'active')
        .limit(10);

      if (newProducts && newProducts.length > 0) {
        // Get users with push subscriptions (excluding sellers of these products)
        const sellerIds = newProducts.map(p => p.seller_id);
        const { data: subscribers } = await supabase
          .from('push_subscriptions')
          .select('user_id')
          .not('user_id', 'in', `(${sellerIds.join(',')})`)
          .limit(100);

        const notified = new Set<string>();
        for (const product of newProducts.slice(0, 3)) {
          if (subscribers) {
            for (const sub of subscribers) {
              if (sub.user_id && !notified.has(sub.user_id)) {
                notified.add(sub.user_id);
              }
            }
          }
          // Send a broadcast-style notification for the newest product
          await sendInternalNotification(supabase, {
            title: '🛒 New Product Near You',
            body: `Check out "${product.title}" just listed!`,
            url: `/product/${product.id}`,
            type: 'new_product',
            broadcast: true,
          });
        }
        results.new_products = newProducts.length;
      }
    }

    // 2. Seller View Milestones - "Your product got X views!"
    if (!action || action === 'seller_views') {
      const { data: topViewed } = await supabase
        .from('products')
        .select('id, title, views, seller_id')
        .eq('status', 'active')
        .gte('views', 10)
        .order('views', { ascending: false })
        .limit(20);

      if (topViewed) {
        const milestones = [10, 25, 50, 100, 250, 500, 1000, 5000];
        let sellerNotifs = 0;

        for (const product of topViewed) {
          const views = product.views || 0;
          // Find the highest milestone reached
          const milestone = milestones.filter(m => views >= m).pop();
          if (!milestone) continue;

          // Check if we already notified for this milestone
          const { data: existing } = await supabase
            .from('notifications_history')
            .select('id')
            .eq('user_id', product.seller_id)
            .eq('type', 'seller_views')
            .like('body', `%${milestone} views%`)
            .limit(1);

          if (existing && existing.length > 0) continue;

          await sendInternalNotification(supabase, {
            title: '📈 Your Product is Trending!',
            body: `"${product.title}" reached ${milestone} views — keep sharing!`,
            url: `/seller-dashboard`,
            type: 'seller_views',
            userId: product.seller_id,
          });
          sellerNotifs++;
        }
        results.seller_views = sellerNotifs;
      }
    }

    // 3. Re-engagement - "A product you viewed is still available"
    if (!action || action === 'reengagement') {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentViews } = await supabase
        .from('product_views')
        .select('user_id, product_id')
        .not('user_id', 'is', null)
        .lte('created_at', oneDayAgo)
        .gte('created_at', threeDaysAgo)
        .limit(50);

      if (recentViews) {
        const uniqueUsers = new Map<string, string>();
        for (const view of recentViews) {
          if (view.user_id && !uniqueUsers.has(view.user_id)) {
            uniqueUsers.set(view.user_id, view.product_id);
          }
        }

        let reengaged = 0;
        for (const [userId, productId] of uniqueUsers) {
          // Check product still active
          const { data: product } = await supabase
            .from('products')
            .select('title, status')
            .eq('id', productId)
            .maybeSingle();

          if (!product || product.status !== 'active') continue;

          // Check we haven't sent reengagement recently
          const { data: recent } = await supabase
            .from('notifications_history')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'reengagement')
            .gte('sent_at', oneDayAgo)
            .limit(1);

          if (recent && recent.length > 0) continue;

          await sendInternalNotification(supabase, {
            title: '🔔 Still Available!',
            body: `"${product.title}" you viewed is still up for grabs.`,
            url: `/product/${productId}`,
            type: 'reengagement',
            userId,
          });
          reengaged++;
        }
        results.reengagement = reengaged;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('AI notification error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendInternalNotification(
  supabase: ReturnType<typeof createClient>,
  opts: {
    title: string;
    body: string;
    url?: string;
    type?: string;
    userId?: string;
    broadcast?: boolean;
  }
) {
  const { title, body, url, type, userId, broadcast } = opts;

  // Create in-app notification
  await supabase.from('notifications').insert({
    title,
    message: body,
    type: type || 'ai',
    user_id: userId || null,
  });

  // Log to history
  if (userId) {
    await supabase.from('notifications_history').insert({
      user_id: userId,
      title,
      body,
      type: type || 'ai',
      url: url || '/',
      delivered: true,
    });
  }
}
