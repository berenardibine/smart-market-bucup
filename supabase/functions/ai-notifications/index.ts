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
    // Use 'any' to avoid strict type checking with dynamic table operations
    const supabase: any = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { action } = await req.json();
    const results: Record<string, number> = {};

    // 1. New Product Alerts
    if (!action || action === 'new_products') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: newProducts } = await supabase
        .from('products')
        .select('id, title, country, category, seller_id, slug')
        .gte('created_at', oneHourAgo)
        .eq('status', 'active')
        .limit(10);

      if (newProducts && newProducts.length > 0) {
        const sellerIds = newProducts.map((p: any) => p.seller_id);
        const { data: subscribers } = await supabase
          .from('push_subscriptions')
          .select('user_id')
          .not('user_id', 'in', `(${sellerIds.join(',')})`)
          .limit(100);

        for (const product of newProducts.slice(0, 3)) {
          await sendPushViaFCM({
            title: '🛒 New Product Near You',
            body: `Check out "${product.title}" just listed!`,
            url: `/product/${product.slug || product.id}`,
            type: 'new_product',
            broadcast: true,
            supabase,
            subscribers,
          });
        }
        results.new_products = newProducts.length;
      }
    }

    // 2. Seller View Milestones
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
          const milestone = milestones.filter((m: number) => views >= m).pop();
          if (!milestone) continue;

          const { data: existing } = await supabase
            .from('notifications_history')
            .select('id')
            .eq('user_id', product.seller_id)
            .eq('type', 'seller_views')
            .like('body', `%${milestone} views%`)
            .limit(1);

          if (existing && existing.length > 0) continue;

          await sendPushViaFCM({
            title: '📈 Your Product is Trending!',
            body: `"${product.title}" reached ${milestone} views — keep sharing!`,
            url: `/seller-dashboard`,
            type: 'seller_views',
            userId: product.seller_id,
            supabase,
          });
          sellerNotifs++;
        }
        results.seller_views = sellerNotifs;
      }
    }

    // 3. Re-engagement
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
          const { data: product } = await supabase
            .from('products')
            .select('title, status, slug')
            .eq('id', productId)
            .maybeSingle();

          if (!product || product.status !== 'active') continue;

          const { data: recent } = await supabase
            .from('notifications_history')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'reengagement')
            .gte('sent_at', oneDayAgo)
            .limit(1);

          if (recent && recent.length > 0) continue;

          await sendPushViaFCM({
            title: '🔔 Still Available!',
            body: `"${product.title}" you viewed is still up for grabs.`,
            url: `/product/${product.slug || productId}`,
            type: 'reengagement',
            userId,
            supabase,
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

// Send push notification via FCM and log it
async function sendPushViaFCM(opts: {
  title: string;
  body: string;
  url?: string;
  type?: string;
  userId?: string;
  broadcast?: boolean;
  supabase: any;
  subscribers?: any[];
}) {
  const { title, body, url, type, userId, broadcast, supabase, subscribers } = opts;
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

  // Get tokens for targeted or broadcast delivery
  let tokens: string[] = [];

  if (broadcast) {
    const { data } = await supabase.from('notification_tokens').select('token');
    tokens = (data || []).map((t: any) => t.token);
  } else if (userId) {
    const { data } = await supabase.from('notification_tokens').select('token').eq('user_id', userId);
    tokens = (data || []).map((t: any) => t.token);
  }

  // Send via FCM
  if (fcmServerKey && tokens.length > 0) {
    for (const token of tokens) {
      try {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            notification: {
              title,
              body,
              icon: '/favicon.ico',
              click_action: url || '/',
            },
            data: { url: url || '/', type: type || 'ai' },
            to: token,
          }),
        });
      } catch (err) {
        console.error('[FCM] Send failed:', err);
      }
    }
  }

  // Also send via Web Push to push_subscriptions
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tbykrulfzhhkmtgjhvjh.supabase.co';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ title, body, url, userId, broadcast, type }),
    });
  } catch (err) {
    console.error('[send-push] Call failed:', err);
  }

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
      delivered: tokens.length > 0,
    });
  }
}
