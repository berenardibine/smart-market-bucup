import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const baseUrl = "https://smart-market-online.vercel.app";
    const now = new Date().toISOString().split("T")[0];

    // Fetch active products with slugs
    const { data: products } = await supabase
      .from("products")
      .select("slug, id, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(5000);

    // Fetch active shops
    const { data: shops } = await supabase
      .from("shops")
      .select("id, updated_at, name")
      .eq("is_active", true)
      .limit(1000);

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, created_at")
      .limit(200);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/auth</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>${baseUrl}/assets</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/agriculture</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/rent</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
`;

    // Category pages
    for (const cat of categories || []) {
      xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    }

    // Product pages
    for (const p of products || []) {
      const slug = p.slug || p.id;
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : now;
      xml += `  <url><loc>${baseUrl}/product/${slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    // Shop pages
    for (const s of shops || []) {
      const lastmod = s.updated_at ? new Date(s.updated_at).toISOString().split("T")[0] : now;
      xml += `  <url><loc>${baseUrl}/shop/${s.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[generate-sitemap] Error:", error);
    return new Response("Error generating sitemap", { status: 500, headers: corsHeaders });
  }
});
