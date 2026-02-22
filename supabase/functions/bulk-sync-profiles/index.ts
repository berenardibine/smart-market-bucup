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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all auth users (paginated)
    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      if (!users || users.length === 0) break;
      allUsers.push(...users);
      if (users.length < perPage) break;
      page++;
    }

    // Get all existing profile IDs
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesError) throw profilesError;

    const existingIds = new Set((existingProfiles || []).map((p: any) => p.id));
    const missingUsers = allUsers.filter(u => !existingIds.has(u.id));

    let synced = 0;
    const errors: string[] = [];

    for (const user of missingUsers) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          profile_image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          user_type: 'seller',
          status: 'active',
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        errors.push(`${user.id}: ${insertError.message}`);
      } else {
        synced++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_auth_users: allUsers.length,
        existing_profiles: existingIds.size,
        missing: missingUsers.length,
        synced,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bulk sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
