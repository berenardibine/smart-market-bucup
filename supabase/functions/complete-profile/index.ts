import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const body = await req.json();
    const { full_name, call_number, whatsapp_number, country, country_code, city, currency_code, currency_symbol, lat, lng, region, profile_image } = body;

    // Validate required fields
    if (!full_name || !full_name.trim()) {
      return new Response(
        JSON.stringify({ error: "Full name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!call_number || !whatsapp_number) {
      return new Response(
        JSON.stringify({ error: "Both call number and WhatsApp number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidPhone(call_number)) {
      return new Response(
        JSON.stringify({ error: "Invalid call number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidPhone(whatsapp_number)) {
      return new Response(
        JSON.stringify({ error: "Invalid WhatsApp number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect IP
    const forwarded = req.headers.get("x-forwarded-for");
    const detected_ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Check if profile already exists (update case)
    const { data: existing } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      // Update existing profile
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({
          full_name: full_name.trim(),
          call_number: call_number.trim(),
          whatsapp_number: whatsapp_number.trim(),
          phone_number: call_number.trim(),
          country: country || null,
          country_code: country_code || null,
          city: city || null,
          region: region || null,
          currency_code: currency_code || null,
          currency_symbol: currency_symbol || null,
          lat: lat || null,
          lng: lng || null,
          last_active: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create new profile
      const { error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: userId,
          email: user.email!,
          full_name: full_name.trim(),
          profile_image: profile_image || user.user_metadata?.avatar_url || null,
          user_type: "seller",
          status: "active",
          call_number: call_number.trim(),
          whatsapp_number: whatsapp_number.trim(),
          phone_number: call_number.trim(),
          detected_ip,
          country: country || null,
          country_code: country_code || null,
          city: city || null,
          region: region || null,
          currency_code: currency_code || null,
          currency_symbol: currency_symbol || null,
          lat: lat || null,
          lng: lng || null,
          last_active: new Date().toISOString(),
          last_location_update: lat ? new Date().toISOString() : null,
          auto_location_enabled: true,
        });

      if (insertError) {
        console.error("Profile insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Log to audit
    await adminClient.from("admin_audit_log").insert({
      event_type: existing ? "profile_updated" : "profile_created",
      user_id: userId,
      details: {
        call_last4: call_number.slice(-4),
        whatsapp_last4: whatsapp_number.slice(-4),
        country: country || null,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("complete-profile error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
