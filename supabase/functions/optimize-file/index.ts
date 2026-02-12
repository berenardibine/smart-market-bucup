import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Size configurations - all targets ≤100KB output
const SIZE_CONFIG = {
  product_card: { width: 512, height: 512, quality: 85, format: 'webp', maxSizeKB: 100 },
  product_detail: { width: 800, height: 800, quality: 80, format: 'webp', maxSizeKB: 100 },
  profile: { width: 400, height: 400, quality: 85, format: 'webp', maxSizeKB: 100 },
  banner: { width: 1200, height: 400, quality: 75, format: 'webp', maxSizeKB: 100 },
  thumbnail: { width: 300, height: 300, quality: 80, format: 'webp', maxSizeKB: 100 },
} as const;

interface OptimizationRequest {
  imageUrl: string;
  userId?: string;
  targetType?: keyof typeof SIZE_CONFIG;
  enhanceQuality?: boolean;
  skipResize?: boolean;
}

interface OptimizationResult {
  optimizedUrl: string;
  originalUrl: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  wasEnhanced: boolean;
  wasResized: boolean;
  targetDimensions: { width: number; height: number };
  format: string;
  qualityScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId, targetType = 'product_card', enhanceQuality = true, skipResize = false }: OptimizationRequest = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[File Optimizer] Starting optimization for:', imageUrl);
    console.log('[File Optimizer] Target type:', targetType, '| Enhance:', enhanceQuality);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[File Optimizer] LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = SIZE_CONFIG[targetType] || SIZE_CONFIG.product_card;

    // Step 1: Analyze image quality
    console.log('[File Optimizer] Step 1: Analyzing image quality...');
    
    const qualityAnalysis = await analyzeImageQuality(imageUrl, LOVABLE_API_KEY);
    console.log('[File Optimizer] Quality analysis:', JSON.stringify(qualityAnalysis));

    // Step 2: Determine if enhancement is needed
    const needsEnhancement = enhanceQuality && (
      qualityAnalysis.brightness < 40 || 
      qualityAnalysis.brightness > 90 ||
      qualityAnalysis.sharpness < 50 ||
      qualityAnalysis.contrast < 40 ||
      qualityAnalysis.hasNoise
    );

    console.log('[File Optimizer] Needs enhancement:', needsEnhancement);

    // Step 3: Process image (enhance, resize, compress)
    const processedImage = await processImage(
      imageUrl, 
      LOVABLE_API_KEY, 
      config, 
      needsEnhancement,
      skipResize,
      qualityAnalysis
    );

    if (!processedImage.success) {
      // Return original on failure
      return new Response(
        JSON.stringify({ 
          optimizedUrl: imageUrl,
          originalUrl: imageUrl,
          originalSize: 0,
          optimizedSize: 0,
          compressionRatio: 0,
          wasEnhanced: false,
          wasResized: false,
          targetDimensions: { width: config.width, height: config.height },
          format: 'original',
          qualityScore: qualityAnalysis.overallScore,
          error: processedImage.error
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Upload optimized image to storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `optimized-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${config.format}`;
    const filePath = `optimized/${userId || 'system'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, processedImage.data, {
        contentType: config.format === 'webp' ? 'image/webp' : 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('[File Optimizer] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ 
          optimizedUrl: imageUrl,
          originalUrl: imageUrl,
          error: 'Upload failed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // Step 5: Log optimization stats
    await logOptimizationStats(supabase, {
      userId,
      originalUrl: imageUrl,
      optimizedUrl: publicUrl,
      originalSize: processedImage.originalSize,
      optimizedSize: processedImage.optimizedSize,
      compressionRatio: processedImage.compressionRatio,
      wasEnhanced: needsEnhancement,
      targetType
    });

    const result: OptimizationResult = {
      optimizedUrl: publicUrl,
      originalUrl: imageUrl,
      originalSize: processedImage.originalSize,
      optimizedSize: processedImage.optimizedSize,
      compressionRatio: processedImage.compressionRatio,
      wasEnhanced: needsEnhancement,
      wasResized: !skipResize,
      targetDimensions: { width: config.width, height: config.height },
      format: config.format,
      qualityScore: qualityAnalysis.overallScore
    };

    console.log('[File Optimizer] Optimization complete:', JSON.stringify(result));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[File Optimizer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Optimization failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface QualityAnalysis {
  brightness: number;
  contrast: number;
  sharpness: number;
  hasNoise: boolean;
  overallScore: number;
  issues: string[];
}

async function analyzeImageQuality(imageUrl: string, apiKey: string): Promise<QualityAnalysis> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Analyze this image's quality for e-commerce use. Rate each aspect 0-100.

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "brightness": 0-100 (50 is ideal, <40 is too dark, >90 is too bright),
  "contrast": 0-100 (higher is better defined),
  "sharpness": 0-100 (higher is clearer),
  "hasNoise": true/false,
  "overallScore": 0-100,
  "issues": ["list of quality issues if any"]
}

Analyze: brightness level, contrast quality, sharpness/blur, noise/grain, overall quality score.` 
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.error('[File Optimizer] Quality analysis failed:', response.status);
      return getDefaultQualityAnalysis();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as QualityAnalysis;
    }
    
    return getDefaultQualityAnalysis();
  } catch (error) {
    console.error('[File Optimizer] Quality analysis error:', error);
    return getDefaultQualityAnalysis();
  }
}

function getDefaultQualityAnalysis(): QualityAnalysis {
  return {
    brightness: 60,
    contrast: 60,
    sharpness: 60,
    hasNoise: false,
    overallScore: 60,
    issues: []
  };
}

interface ProcessResult {
  success: boolean;
  data: Uint8Array;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  error?: string;
}

async function processImage(
  imageUrl: string, 
  apiKey: string, 
  config: { width: number; height: number; quality: number; format: string },
  enhance: boolean,
  skipResize: boolean,
  qualityAnalysis: QualityAnalysis
): Promise<ProcessResult> {
  try {
    // Fetch original image to get size
    const originalResponse = await fetch(imageUrl);
    if (!originalResponse.ok) {
      throw new Error('Failed to fetch original image');
    }
    const originalBuffer = await originalResponse.arrayBuffer();
    const originalSize = originalBuffer.byteLength;

    // Build enhancement/optimization prompt
    let prompt = `Process this image for e-commerce use. `;
    
    if (enhance) {
      const enhancements: string[] = [];
      if (qualityAnalysis.brightness < 40) {
        enhancements.push('increase brightness to make it well-lit');
      } else if (qualityAnalysis.brightness > 90) {
        enhancements.push('reduce brightness to prevent overexposure');
      }
      if (qualityAnalysis.sharpness < 50) {
        enhancements.push('sharpen the image for clarity');
      }
      if (qualityAnalysis.contrast < 40) {
        enhancements.push('improve contrast for better definition');
      }
      if (qualityAnalysis.hasNoise) {
        enhancements.push('reduce noise while preserving details');
      }
      
      if (enhancements.length > 0) {
        prompt += `Enhance the image: ${enhancements.join(', ')}. `;
      }
    }

    if (!skipResize) {
      prompt += `Resize and crop to ${config.width}x${config.height} pixels with centered composition, maintaining the main subject's focus. `;
    }

    prompt += `Output a high-quality ${config.format.toUpperCase()} image suitable for product display. Keep colors accurate and natural.`;

    console.log('[File Optimizer] Processing with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[File Optimizer] Image processing failed:', response.status, errorText);
      
      if (response.status === 429) {
        return { success: false, data: new Uint8Array(), originalSize, optimizedSize: 0, compressionRatio: 0, error: 'Rate limit exceeded' };
      }
      if (response.status === 402) {
        return { success: false, data: new Uint8Array(), originalSize, optimizedSize: 0, compressionRatio: 0, error: 'AI credits depleted' };
      }
      
      return { success: false, data: new Uint8Array(), originalSize, optimizedSize: 0, compressionRatio: 0, error: 'Processing failed' };
    }

    const data = await response.json();
    const processedImageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!processedImageBase64) {
      console.log('[File Optimizer] No processed image returned');
      return { success: false, data: new Uint8Array(), originalSize, optimizedSize: 0, compressionRatio: 0, error: 'No image returned' };
    }

    // Convert base64 to binary
    const base64Data = processedImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const optimizedSize = binaryData.byteLength;
    const compressionRatio = Math.round((1 - optimizedSize / originalSize) * 100);

    console.log(`[File Optimizer] Compression: ${originalSize} -> ${optimizedSize} bytes (${compressionRatio}% reduction)`);

    return {
      success: true,
      data: binaryData,
      originalSize,
      optimizedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('[File Optimizer] Process error:', error);
    return { 
      success: false, 
      data: new Uint8Array(), 
      originalSize: 0, 
      optimizedSize: 0, 
      compressionRatio: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function logOptimizationStats(
  supabase: any,
  stats: {
    userId?: string;
    originalUrl: string;
    optimizedUrl: string;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    wasEnhanced: boolean;
    targetType: string;
  }
) {
  try {
    await supabase.from('file_optimization_logs').insert({
      user_id: stats.userId || null,
      original_url: stats.originalUrl,
      optimized_url: stats.optimizedUrl,
      original_size: stats.originalSize,
      optimized_size: stats.optimizedSize,
      compression_ratio: stats.compressionRatio,
      was_enhanced: stats.wasEnhanced,
      target_type: stats.targetType
    });
  } catch (error) {
    console.error('[File Optimizer] Failed to log stats:', error);
  }
}
