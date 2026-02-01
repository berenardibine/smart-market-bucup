import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Check if there's already an impression in the last hour using the database function
    const { data: hasRecent, error: checkError } = await supabase
      .rpc('check_recent_impression', {
        p_product_id: productId,
        p_session_id: sessionId,
        p_hours: 1
      });

    if (checkError) {
      console.error('Error checking recent impression:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check recent impression' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already recorded within the hour, skip
    if (hasRecent) {
      return new Response(
        JSON.stringify({ success: true, recorded: false, reason: 'Already recorded within the hour' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new impression record
    const { error: insertError } = await supabase
      .from('product_impressions')
      .insert({
        product_id: productId,
        user_id: userId || null,
        session_id: sessionId,
        ref_source: refSource || 'home'
      });

    if (insertError) {
      console.error('Error inserting impression:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record impression' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
