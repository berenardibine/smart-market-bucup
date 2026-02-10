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

    const { title, body, url, userId, broadcast, type } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get subscriptions from push_subscriptions table
    let query = supabase.from('push_subscriptions').select('*');
    if (!broadcast && userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;
    if (error) throw error;

    // Also check notification_tokens table
    let tokenQuery = supabase.from('notification_tokens').select('*');
    if (!broadcast && userId) {
      tokenQuery = tokenQuery.eq('user_id', userId);
    }
    const { data: tokens } = await tokenQuery;

    const allTargets = [
      ...(subscriptions || []).map(s => ({ type: 'web-push', data: s })),
      ...(tokens || []).map(t => ({ type: 'fcm-token', data: t })),
    ];

    if (allTargets.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const payload = JSON.stringify({ title, body, url: url || '/', icon: '/favicon.ico' });
    let sent = 0;
    let failed = 0;

    for (const target of allTargets) {
      try {
        if (target.type === 'web-push') {
          const sub = target.data;
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
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            failed++;
          } else {
            failed++;
          }
        }
      } catch (err) {
        console.error(`Failed to send notification:`, err);
        failed++;
      }
    }

    // Log to notifications_history
    const historyEntries = [];
    if (broadcast) {
      // Get all unique user_ids
      const userIds = new Set<string>();
      allTargets.forEach(t => {
        if (t.data.user_id) userIds.add(t.data.user_id);
      });
      userIds.forEach(uid => {
        historyEntries.push({
          user_id: uid,
          title,
          body,
          type: type || 'broadcast',
          url: url || '/',
          delivered: sent > 0,
        });
      });
      // Also create in-app notification
      await supabase.from('notifications').insert({
        title,
        message: body,
        type: 'push',
        user_id: null,
      });
    } else if (userId) {
      historyEntries.push({
        user_id: userId,
        title,
        body,
        type: type || 'direct',
        url: url || '/',
        delivered: sent > 0,
      });
      await supabase.from('notifications').insert({
        title,
        message: body,
        type: 'push',
        user_id: userId,
      });
    }

    if (historyEntries.length > 0) {
      await supabase.from('notifications_history').insert(historyEntries);
    }

    return new Response(JSON.stringify({ sent, failed, total: allTargets.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('Push notification error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
