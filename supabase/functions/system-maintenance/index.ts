import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Record<string, unknown> = {};

    // 1. Clean expired boosts
    const { data: expiredBoosts, error: boostErr } = await supabase
      .from('boosted_products')
      .update({ status: 'expired' })
      .lt('end_date', new Date().toISOString())
      .eq('status', 'active')
      .select('id');

    results.expiredBoosts = expiredBoosts?.length || 0;
    if (boostErr) console.error('[Maintenance] Boost cleanup error:', boostErr);

    // 2. Reset expired discounts on products
    const { data: expiredDiscounts, error: discErr } = await supabase
      .from('products')
      .update({ discount: 0, discount_expiry: null })
      .lt('discount_expiry', new Date().toISOString())
      .gt('discount', 0)
      .select('id');

    results.expiredDiscounts = expiredDiscounts?.length || 0;
    if (discErr) console.error('[Maintenance] Discount cleanup error:', discErr);

    // 3. Audit unoptimized product images
    const { data: products } = await supabase
      .from('products')
      .select('id, title, images')
      .not('images', 'is', null);

    const { data: existingLogs } = await supabase
      .from('file_optimization_logs')
      .select('original_url, optimized_url');

    const optimizedUrls = new Set([
      ...(existingLogs || []).map(l => l.original_url),
      ...(existingLogs || []).map(l => l.optimized_url),
    ]);

    let auditEntries = 0;
    for (const p of (products || [])) {
      const images = (p.images as string[]) || [];
      for (const img of images) {
        if (!optimizedUrls.has(img)) {
          // Log to optimization_audit
          await supabase.from('optimization_audit').upsert({
            file_name: img.split('/').pop() || 'unknown',
            file_url: img,
            product_id: p.id,
            original_size: 0,
            current_size: 0,
            status: 'not_optimized',
            detected_at: new Date().toISOString(),
          }, { onConflict: 'file_url' }).select();
          auditEntries++;
        }
      }
    }
    results.unoptimizedFilesDetected = auditEntries;

    // 4. Count optimization errors
    const { count: pendingErrors } = await supabase
      .from('optimization_errors')
      .select('id', { count: 'exact', head: true })
      .eq('resolved', false);

    results.pendingErrors = pendingErrors || 0;

    // 5. Log this maintenance run
    await supabase.from('system_logs').insert({
      job_type: 'maintenance',
      details: results,
      status: 'completed',
    });

    console.log('[Maintenance] Completed:', results);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Maintenance] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Maintenance failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
