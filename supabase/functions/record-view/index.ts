import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { productId, userId, sessionId, refSource } = await req.json();

    if (!productId || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId and sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's already a view in the last 10 minutes using the database function
    const { data: hasRecent, error: checkError } = await supabase
      .rpc('check_recent_view', {
        p_product_id: productId,
        p_session_id: sessionId,
        p_minutes: 10
      });

    if (checkError) {
      console.error('Error checking recent view:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check recent view' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already recorded within 10 minutes, skip
    if (hasRecent) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, reason: 'Already recorded within 10 minutes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new view record
    const { error: insertError } = await supabase
      .from('product_views')
      .insert({
        product_id: productId,
        user_id: userId || null,
        session_id: sessionId,
        ref_source: refSource || 'direct'
      });

    if (insertError) {
      console.error('Error inserting view:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record view' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update metrics cache and daily aggregation (fire and forget)
    const today = new Date().toISOString().split('T')[0];
    
    await Promise.all([
      supabase.rpc('increment_product_metrics', {
        p_product_id: productId,
        p_increment_impressions: 0,
        p_increment_views: 1
      }),
      supabase.rpc('increment_daily_agg', {
        p_product_id: productId,
        p_date: today,
        p_increment_impressions: 0,
        p_increment_views: 1
      })
    ]).catch(err => console.error('Error updating aggregates:', err));

    return new Response(
      JSON.stringify({ success: true, recorded: true }),
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
