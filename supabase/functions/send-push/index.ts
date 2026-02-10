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
    const supabase = createClient(
      'https://tbykrulfzhhkmtgjhvjh.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { title, body, url, userId, broadcast } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    if (!broadcast && userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;
    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vapidPublicKey = 'BJQLmyHGaCpq_n_BhNqefS1x1MoK4DqjkAC793XzKEhaA3OmVOOx1OyjjB-HI7XqsCqarTmncXH4B_v4mGKJecw';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPrivateKey) {
      console.warn('VAPID_PRIVATE_KEY not configured. Push notifications won\'t be sent.');
      return new Response(JSON.stringify({ 
        sent: 0, 
        error: 'VAPID_PRIVATE_KEY not configured',
        message: 'Please add the VAPID private key to edge function secrets' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ title, body, url: url || '/' });
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        // Use the Web Push protocol to send notifications
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'TTL': '86400',
          },
          body: payload,
        });

        if (response.ok || response.status === 201) {
          sent++;
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, clean up
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          failed++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Failed to send to ${sub.endpoint}:`, err);
        failed++;
      }
    }

    // Also create an in-app notification
    if (broadcast) {
      await supabase.from('notifications').insert({
        title,
        message: body,
        type: 'push',
        user_id: null, // null = broadcast to all
      });
    } else if (userId) {
      await supabase.from('notifications').insert({
        title,
        message: body,
        type: 'push',
        user_id: userId,
      });
    }

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Push notification error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
