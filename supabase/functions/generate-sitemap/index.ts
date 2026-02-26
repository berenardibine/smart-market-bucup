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

    // Fetch active products with slugs and shop info
    const { data: products } = await supabase
      .from("products")
      .select("slug, id, updated_at, shop_id")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(5000);

    // Fetch shops for slug mapping
    const { data: shops } = await supabase
      .from("shops")
      .select("id, slug, updated_at, name")
      .eq("is_active", true)
      .limit(1000);

    // Create shop slug lookup
    const shopSlugMap = new Map<string, string>();
    for (const s of shops || []) {
      if (s.slug) shopSlugMap.set(s.id, s.slug);
    }

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, created_at")
      .limit(200);

    // Fetch site pages
    const { data: sitePages } = await supabase
      .from("site_pages")
      .select("slug, updated_at")
      .eq("is_published", true)
      .limit(50);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/auth</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
  <url><loc>${baseUrl}/assets</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/agriculture</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/rent</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
`;

    // Site pages (privacy, terms, about, disclaimer) — use top-level slugs
    for (const page of sitePages || []) {
      const lastmod = page.updated_at ? new Date(page.updated_at).toISOString().split("T")[0] : now;
      xml += `  <url><loc>${baseUrl}/${page.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
    }

    // Category pages — use top-level slugs
    for (const cat of categories || []) {
      xml += `  <url><loc>${baseUrl}/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    }

    // Product pages - use SEO-friendly URLs with shop slug when available
    for (const p of products || []) {
      const slug = p.slug || p.id;
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : now;
      const shopSlug = p.shop_id ? shopSlugMap.get(p.shop_id) : null;
      
      if (shopSlug) {
        xml += `  <url><loc>${baseUrl}/products/${slug}/by/${shopSlug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      } else {
        xml += `  <url><loc>${baseUrl}/product/${slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      }
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
