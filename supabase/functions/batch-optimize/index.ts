import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BatchOptimizeRequest {
  limit?: number;
  minSizeBytes?: number;
  dryRun?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 50, minSizeBytes = 512000, dryRun = false }: BatchOptimizeRequest = await req.json();

    console.log('[Batch Optimizer] Starting batch optimization...');
    console.log(`[Batch Optimizer] Limit: ${limit}, Min size: ${minSizeBytes} bytes, Dry run: ${dryRun}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get list of files from storage that haven't been optimized
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error('[Batch Optimizer] Failed to list files:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list files', details: listError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all folders and their contents
    const allFiles: { path: string; size: number; created_at: string }[] = [];
    
    for (const folder of files) {
      if (folder.id) {
        // It's a file at root level
        allFiles.push({ path: folder.name, size: folder.metadata?.size || 0, created_at: folder.created_at });
      } else {
        // It's a folder, get its contents
        const { data: folderFiles } = await supabase.storage
          .from('product-images')
          .list(folder.name, { limit: 500 });
        
        if (folderFiles) {
          for (const file of folderFiles) {
            if (file.id && !file.name.includes('optimized') && !file.name.includes('processed')) {
              allFiles.push({
                path: `${folder.name}/${file.name}`,
                size: file.metadata?.size || 0,
                created_at: file.created_at
              });
            }
          }
        }
      }
    }

    console.log(`[Batch Optimizer] Found ${allFiles.length} total files`);

    // Filter files that need optimization (>500KB and not already optimized)
    const filesToOptimize = allFiles
      .filter(f => f.size > minSizeBytes && !f.path.includes('optimized/'))
      .slice(0, limit);

    console.log(`[Batch Optimizer] ${filesToOptimize.length} files need optimization`);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          totalFiles: allFiles.length,
          filesToOptimize: filesToOptimize.length,
          estimatedSavings: Math.round(filesToOptimize.reduce((sum, f) => sum + f.size * 0.7, 0) / 1024 / 1024) + ' MB',
          files: filesToOptimize.map(f => ({ path: f.path, size: f.size }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process files
    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      errors: [] as string[]
    };

    for (const file of filesToOptimize) {
      try {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(file.path);

        // Call the optimize-file function
        const response = await fetch(`${supabaseUrl}/functions/v1/optimize-file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl: publicUrl,
            targetType: 'product_card',
            enhanceQuality: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.optimizedUrl && result.optimizedUrl !== publicUrl) {
            results.processed++;
            results.totalOriginalSize += result.originalSize || 0;
            results.totalOptimizedSize += result.optimizedSize || 0;

            // Archive original file (move to archive folder)
            const archivePath = `archive/${file.path}`;
            const { data: originalFile } = await supabase.storage
              .from('product-images')
              .download(file.path);
            
            if (originalFile) {
              await supabase.storage
                .from('product-images')
                .upload(archivePath, originalFile, { upsert: true });
            }

            console.log(`[Batch Optimizer] Optimized: ${file.path}`);
          } else {
            results.skipped++;
          }
        } else {
          results.failed++;
          results.errors.push(`Failed: ${file.path}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error: ${file.path} - ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const spaceSaved = results.totalOriginalSize - results.totalOptimizedSize;
    const compressionRatio = results.totalOriginalSize > 0 
      ? Math.round((spaceSaved / results.totalOriginalSize) * 100) 
      : 0;

    // Log batch job results
    await supabase.from('batch_optimization_jobs').insert({
      files_processed: results.processed,
      files_failed: results.failed,
      files_skipped: results.skipped,
      original_size_total: results.totalOriginalSize,
      optimized_size_total: results.totalOptimizedSize,
      space_saved: spaceSaved,
      compression_ratio: compressionRatio,
      errors: results.errors
    });

    console.log(`[Batch Optimizer] Complete! Processed: ${results.processed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        spaceSaved: Math.round(spaceSaved / 1024 / 1024) + ' MB',
        compressionRatio: compressionRatio + '%'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Batch Optimizer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Batch optimization failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
