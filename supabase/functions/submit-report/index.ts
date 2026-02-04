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

    const { productId, sellerId, reporterName, reporterPhone, reporterEmail, reason, details } = await req.json();

    // Validate required fields
    if (!reporterName || !reporterPhone || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: reporterName, reporterPhone, and reason are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // At least one of productId or sellerId must be provided
    if (!productId && !sellerId) {
      return new Response(
        JSON.stringify({ error: 'Either productId or sellerId must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        product_id: productId || null,
        reported_seller_id: sellerId || null,
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        reporter_email: reporterEmail || null,
        reason: reason,
        details: details || null,
        status: 'new'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting report:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for admin
    await supabase
      .from('notifications')
      .insert({
        user_id: null, // Admin notification (null = broadcast to admins)
        title: 'New Report Submitted',
        message: `A new ${productId ? 'product' : 'seller'} report has been submitted. Reason: ${reason}`,
        type: 'report'
      });

    return new Response(
      JSON.stringify({ success: true, report }),
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
