import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple profanity filter (basic list)
const profanityList = ['spam', 'scam', 'fraud', 'fake', 'stupid', 'idiot'];
const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { productId, sessionId, userId, authorName, content } = await req.json();

    // Validate required fields
    if (!productId || !sessionId || !authorName || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId, sessionId, authorName, and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length
    if (content.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Comment must be at least 5 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (content.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Comment must be less than 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check profanity
    if (containsProfanity(content)) {
      return new Response(
        JSON.stringify({ error: 'Comment contains inappropriate content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: max 5 comments per session per hour
    const { data: commentCount } = await supabase
      .rpc('get_session_comment_count', { p_session_id: sessionId, p_hours: 1 });

    if (commentCount && commentCount >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('product_comments')
      .insert({
        product_id: productId,
        session_id: sessionId,
        user_id: userId || null,
        author_name: authorName,
        content: content
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit comment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, comment }),
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
