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
    const supabase: any = createClient(
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

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    let sent = 0;
    let failed = 0;

    // ── 1. Send via FCM (primary method like Facebook/WhatsApp) ──
    let tokenQuery = supabase.from('notification_tokens').select('*');
    if (!broadcast && userId) {
      tokenQuery = tokenQuery.eq('user_id', userId);
    }
    const { data: tokens } = await tokenQuery;

    if (tokens && tokens.length > 0 && fcmServerKey) {
      for (const tokenRow of tokens) {
        try {
          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
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
                badge: '/favicon.ico',
                click_action: url || '/',
                tag: type || 'smart-market',
              },
              data: {
                url: url || '/',
                type: type || 'general',
                title,
                body,
              },
              to: tokenRow.token,
              priority: 'high',
              time_to_live: 86400,
            }),
          });

          const result = await response.json();
          if (result.success === 1) {
            sent++;
          } else {
            // Token expired or invalid — clean up
            if (result.results?.[0]?.error === 'NotRegistered' || result.results?.[0]?.error === 'InvalidRegistration') {
              await supabase.from('notification_tokens').delete().eq('id', tokenRow.id);
            }
            failed++;
          }
        } catch (err) {
          console.error('[FCM] Send failed:', err);
          failed++;
        }
      }
    }

    // ── 2. Also send via Web Push (VAPID) for browsers without FCM ──
    let pushQuery = supabase.from('push_subscriptions').select('*');
    if (!broadcast && userId) {
      pushQuery = pushQuery.eq('user_id', userId);
    }
    const { data: subscriptions } = await pushQuery;

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title,
        body,
        url: url || '/',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type || 'smart-market-notification',
      });

      for (const sub of subscriptions) {
        try {
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
        } catch (err) {
          console.error('[WebPush] Send failed:', err);
          failed++;
        }
      }
    }

    const totalTargets = (tokens?.length || 0) + (subscriptions?.length || 0);

    // ── 3. Log to notifications_history ──
    const historyEntries: any[] = [];
    if (broadcast) {
      const userIds = new Set<string>();
      (tokens || []).forEach((t: any) => { if (t.user_id) userIds.add(t.user_id); });
      (subscriptions || []).forEach((s: any) => { if (s.user_id) userIds.add(s.user_id); });
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

    return new Response(JSON.stringify({ sent, failed, total: totalTargets }), {
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
