import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keywords for content classification
const KEEP_BACKGROUND_KEYWORDS = [
  'light', 'led', 'rgb', 'lamp', 'room', 'furniture', 'decor', 'interior', 
  'setup', 'wall painting', 'mirror', 'car', 'garden', 'building', 'ambient',
  'neon', 'glow', 'chandelier', 'curtain', 'window', 'outdoor', 'landscape',
  'living room', 'bedroom', 'kitchen', 'bathroom', 'office space', 'studio',
  'art', 'painting', 'mural', 'decoration', 'ornament', 'plant', 'tree',
  'pool', 'patio', 'balcony', 'terrace', 'backyard', 'street', 'vehicle'
];

const REMOVE_BACKGROUND_KEYWORDS = [
  'shoe', 'shoes', 'clothes', 'clothing', 'phone', 'smartphone', 'watch', 
  'bag', 'handbag', 'headphones', 'earphones', 'microphone', 'bottle', 
  'tool', 'accessory', 'food', 'jewelry', 'ring', 'necklace', 'bracelet',
  'laptop', 'tablet', 'camera', 'book', 'cup', 'mug', 'plate', 'bowl',
  'toy', 'game', 'cosmetic', 'makeup', 'perfume', 'glasses', 'sunglasses',
  'wallet', 'belt', 'hat', 'cap', 'scarf', 'glove', 'sock', 'shirt',
  't-shirt', 'pants', 'jeans', 'dress', 'skirt', 'jacket', 'coat',
  'sneaker', 'sandal', 'boot', 'electronic', 'gadget', 'device', 'charger'
];

interface ImageAnalysis {
  mainSubject: string;
  containsHuman: boolean;
  environmentNeeded: boolean;
  confidence: number;
  reason: string;
  hasLightingEffects: boolean;
  isStandaloneProduct: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Smart Background] Processing image:', imageUrl);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[Smart Background] LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Analyze the image to determine if background should be removed
    console.log('[Smart Background] Step 1: Analyzing image content...');
    
    const analysisPrompt = `Analyze this product image and determine if the background should be removed or kept.

RESPOND IN THIS EXACT JSON FORMAT ONLY (no other text):
{
  "mainSubject": "brief description of main subject",
  "containsHuman": true/false,
  "hasLightingEffects": true/false,
  "isStandaloneProduct": true/false,
  "environmentNeeded": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

ANALYSIS RULES:
1. KEEP background (environmentNeeded=true) if:
   - Image has RGB lights, LED effects, lamps, or decorative lighting
   - Product is furniture shown in a room context
   - Product is a car, vehicle, or large equipment in its environment
   - Background shows product in use context (garden tools in garden, etc.)
   - Art, paintings, or wall decor
   - Plants, trees, or landscaping items
   - The lighting/ambiance is part of the product appeal

2. REMOVE background (environmentNeeded=false) if:
   - Single standalone product (phone, shoe, bag, watch, clothes, etc.)
   - Product on plain/messy/irrelevant background (table, floor, hand)
   - E-commerce style product photo needed
   - Small accessories, electronics, jewelry, cosmetics

Analyze carefully and be accurate.`;

    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('[Smart Background] Analysis API error:', analysisResponse.status, errorText);
      
      // Default to removing background on analysis failure
      return await processBackgroundRemoval(imageUrl, userId, LOVABLE_API_KEY, {
        mainSubject: 'unknown',
        containsHuman: false,
        environmentNeeded: false,
        confidence: 0.5,
        reason: 'Analysis failed, defaulting to background removal',
        hasLightingEffects: false,
        isStandaloneProduct: true
      });
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices?.[0]?.message?.content || '';
    console.log('[Smart Background] Analysis response:', analysisText);

    // Parse the JSON response
    let analysis: ImageAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Smart Background] Failed to parse analysis:', parseError);
      // Default to removing background
      analysis = {
        mainSubject: 'product',
        containsHuman: false,
        environmentNeeded: false,
        confidence: 0.5,
        reason: 'Parse error, defaulting to background removal',
        hasLightingEffects: false,
        isStandaloneProduct: true
      };
    }

    console.log('[Smart Background] Parsed analysis:', JSON.stringify(analysis));

    // Step 2: Make decision based on analysis
    const shouldRemoveBackground = !analysis.environmentNeeded && 
                                   !analysis.hasLightingEffects && 
                                   analysis.isStandaloneProduct;

    console.log(`[Smart Background] Decision: ${shouldRemoveBackground ? 'REMOVE' : 'KEEP'} background`);
    console.log(`[Smart Background] Reason: ${analysis.reason}`);

    // Step 3: If keeping background, return original image
    if (!shouldRemoveBackground) {
      console.log('[Smart Background] Keeping original background');
      return new Response(
        JSON.stringify({ 
          processedUrl: imageUrl, 
          wasProcessed: false,
          originalUrl: imageUrl,
          analysis: {
            decision: 'keep',
            reason: analysis.reason,
            mainSubject: analysis.mainSubject,
            confidence: analysis.confidence,
            hasLightingEffects: analysis.hasLightingEffects,
            environmentNeeded: analysis.environmentNeeded
          },
          message: `Background kept: ${analysis.reason}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Remove background
    return await processBackgroundRemoval(imageUrl, userId, LOVABLE_API_KEY, analysis);

  } catch (error: unknown) {
    console.error('[Smart Background] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Background processing failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processBackgroundRemoval(
  imageUrl: string, 
  userId: string | undefined, 
  apiKey: string,
  analysis: ImageAnalysis
): Promise<Response> {
  console.log('[Smart Background] Step 2: Removing background...');

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Remove the background from this product image completely and replace it with a pure clean white background (#FFFFFF). Keep only the main product/subject visible with crisp edges. The result should look professional like an e-commerce product photo with a perfectly white background.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      modalities: ['image', 'text']
    })
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('[Smart Background] Background removal API error:', aiResponse.status, errorText);
    
    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return original image on AI failure
    return new Response(
      JSON.stringify({ 
        processedUrl: imageUrl, 
        wasProcessed: false,
        originalUrl: imageUrl,
        analysis: {
          decision: 'remove_failed',
          reason: 'Background removal failed, keeping original',
          mainSubject: analysis.mainSubject,
          confidence: analysis.confidence
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const aiData = await aiResponse.json();
  console.log('[Smart Background] AI processing complete');
  
  // Extract the processed image from the response
  const processedImageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  
  if (!processedImageBase64) {
    console.log('[Smart Background] No processed image in response, returning original');
    return new Response(
      JSON.stringify({ 
        processedUrl: imageUrl, 
        wasProcessed: false,
        originalUrl: imageUrl,
        analysis: {
          decision: 'remove_failed',
          reason: 'No image returned from AI',
          mainSubject: analysis.mainSubject,
          confidence: analysis.confidence
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Upload the processed image to Supabase Storage
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Convert base64 to binary
  const base64Data = processedImageBase64.replace(/^data:image\/\w+;base64,/, '');
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  // Generate unique filename
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-processed.png`;
  const filePath = `${userId || 'anonymous'}/${fileName}`;

  console.log('[Smart Background] Uploading processed image to storage:', filePath);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, binaryData, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) {
    console.error('[Smart Background] Storage upload error:', uploadError);
    // Return original if upload fails
    return new Response(
      JSON.stringify({ 
        processedUrl: imageUrl, 
        wasProcessed: false,
        originalUrl: imageUrl,
        analysis: {
          decision: 'remove_failed',
          reason: 'Upload failed',
          mainSubject: analysis.mainSubject,
          confidence: analysis.confidence
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  console.log('[Smart Background] Success! Processed image URL:', publicUrl);

  return new Response(
    JSON.stringify({ 
      processedUrl: publicUrl, 
      wasProcessed: true,
      originalUrl: imageUrl,
      analysis: {
        decision: 'removed',
        reason: analysis.reason,
        mainSubject: analysis.mainSubject,
        confidence: analysis.confidence
      },
      message: 'Background cleaned successfully ✅'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
