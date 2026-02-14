import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchIPGeolocation(ip: string) {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      return { country: null, lat: null, lng: null, city: null, region: null, country_code: null, currency_code: null, currency_symbol: null };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,currency`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return {
          country: data.country || null,
          country_code: data.countryCode || null,
          lat: data.lat || null,
          lng: data.lon || null,
          city: data.city || null,
          region: data.regionName || null,
          currency_code: data.currency || null,
          currency_symbol: null,
        };
      }
    }
  } catch (e) {
    console.error("IP geolocation error:", e);
  }
  return { country: null, lat: null, lng: null, city: null, region: null, country_code: null, currency_code: null, currency_symbol: null };
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
      console.error("auth-sync: user verification failed", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userEmail = user.email;

    // Detect IP
    const forwarded = req.headers.get("x-forwarded-for");
    const detected_ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Parse body for client-side geo data
    let clientGeo: any = {};
    try {
      const body = await req.json();
      clientGeo = body || {};
    } catch {
      // No body sent
    }

    // Fetch IP geolocation as fallback
    const ipGeo = await fetchIPGeolocation(detected_ip);

    const geoData = {
      country: clientGeo.country || ipGeo.country,
      country_code: clientGeo.country_code || ipGeo.country_code,
      lat: clientGeo.lat || ipGeo.lat,
      lng: clientGeo.lng || ipGeo.lng,
      city: clientGeo.city || ipGeo.city,
      region: clientGeo.region || ipGeo.region,
      currency_code: clientGeo.currency_code || ipGeo.currency_code,
      currency_symbol: clientGeo.currency_symbol || ipGeo.currency_symbol,
    };

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      userEmail?.split("@")[0] ||
      "User";
    const profileImage =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    // Check if profile exists by ID
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, call_number, whatsapp_number, country")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      // Update existing profile - user already completed profile before
      const updateData: any = {
        last_active: new Date().toISOString(),
        detected_ip,
      };
      if (!existingProfile.country && geoData.country) {
        updateData.country = geoData.country;
        updateData.country_code = geoData.country_code;
        updateData.lat = geoData.lat;
        updateData.lng = geoData.lng;
        updateData.city = geoData.city;
        updateData.region = geoData.region;
        updateData.currency_code = geoData.currency_code;
        updateData.currency_symbol = geoData.currency_symbol;
        updateData.last_location_update = new Date().toISOString();
      }

      await adminClient.from("profiles").update(updateData).eq("id", userId);

      await adminClient.from("admin_audit_log").insert({
        event_type: "auth_sync_update",
        user_id: userId,
        details: { provider: user.app_metadata?.provider || "email", ip: detected_ip },
      });

      return new Response(JSON.stringify({ needsProfile: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check by email for existing profile (merge case)
    const { data: emailProfile } = await adminClient
      .from("profiles")
      .select("id, call_number, whatsapp_number")
      .eq("email", userEmail)
      .maybeSingle();

    if (emailProfile) {
      await adminClient
        .from("profiles")
        .update({
          id: userId,
          last_active: new Date().toISOString(),
          detected_ip,
          profile_image: profileImage || undefined,
          country: geoData.country || undefined,
          country_code: geoData.country_code || undefined,
          lat: geoData.lat || undefined,
          lng: geoData.lng || undefined,
          city: geoData.city || undefined,
          region: geoData.region || undefined,
          last_location_update: new Date().toISOString(),
        })
        .eq("id", emailProfile.id);

      return new Response(JSON.stringify({ needsProfile: false, merged: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NEW: Do NOT create profile here. Return metadata so frontend can show Complete Profile form.
    return new Response(JSON.stringify({
      needsProfile: true,
      metadata: {
        fullName,
        email: userEmail,
        profileImage,
        geo: geoData,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("auth-sync error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
