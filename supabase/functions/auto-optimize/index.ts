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

    console.log('[Auto-Optimize] Starting scheduled optimization run...');

    // Get already optimized URLs
    const { data: logs } = await supabase
      .from('file_optimization_logs')
      .select('original_url, optimized_url');

    const optimizedUrls = new Set([
      ...(logs || []).map(l => l.original_url),
      ...(logs || []).map(l => l.optimized_url),
    ]);

    // Get all products with images
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, title, images')
      .not('images', 'is', null);

    if (prodErr) {
      console.error('[Auto-Optimize] Failed to fetch products:', prodErr);
      throw prodErr;
    }

    // Find unoptimized images
    const unoptimized: { productId: string; imageUrl: string; index: number }[] = [];
    for (const p of (products || [])) {
      const images = (p.images as string[]) || [];
      images.forEach((img, idx) => {
        if (!optimizedUrls.has(img)) {
          unoptimized.push({ productId: p.id, imageUrl: img, index: idx });
        }
      });
    }

    console.log(`[Auto-Optimize] Found ${unoptimized.length} unoptimized images`);

    // Process up to 25 images per run to stay within time limits
    const batch = unoptimized.slice(0, 25);
    let processed = 0;
    let failed = 0;
    let totalSaved = 0;

    for (const item of batch) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/optimize-file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: item.imageUrl,
            targetType: 'product_card',
            enhanceQuality: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.optimizedUrl && result.optimizedUrl !== item.imageUrl) {
            // Update product images array
            const { data: product } = await supabase
              .from('products')
              .select('images')
              .eq('id', item.productId)
              .single();

            if (product) {
              const images = (product.images as string[]) || [];
              const updated = images.map(img => img === item.imageUrl ? result.optimizedUrl : img);
              await supabase.from('products').update({ images: updated }).eq('id', item.productId);
            }

            processed++;
            totalSaved += (result.originalSize || 0) - (result.optimizedSize || 0);
          }
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      // Delay between requests
      await new Promise(r => setTimeout(r, 800));
    }

    // Log the batch job
    await supabase.from('batch_optimization_jobs').insert({
      files_processed: processed,
      files_failed: failed,
      files_skipped: unoptimized.length - batch.length,
      space_saved: totalSaved,
      compression_ratio: totalSaved > 0 ? Math.round((totalSaved / (totalSaved + processed * 50000)) * 100) : 0,
      status: 'completed',
    });

    console.log(`[Auto-Optimize] Done. Processed: ${processed}, Failed: ${failed}, Remaining: ${unoptimized.length - batch.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        failed,
        remaining: unoptimized.length - batch.length,
        spaceSaved: totalSaved,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Auto-Optimize] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Auto-optimization failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
