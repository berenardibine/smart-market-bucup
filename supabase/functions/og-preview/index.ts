import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRAWLER_USER_AGENTS = [
  "facebookexternalhit", "Facebot", "LinkedInBot", "Twitterbot", "WhatsApp",
  "TelegramBot", "Slackbot", "Discordbot", "Pinterest", "vkShare",
  "W3C_Validator", "redditbot", "Applebot", "bingbot", "Googlebot",
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some((c) => userAgent.toLowerCase().includes(c.toLowerCase()));
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount);
}

function generateMetaHtml(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
  baseUrl: string;
  extraMeta?: string;
  jsonLd?: string;
}): string {
  const { title, description, image, url, type = "website", siteName = "Smart Market — Buy Smart, Live Smart", baseUrl, extraMeta = "", jsonLd } = opts;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description.length > 150 ? description.substring(0, 147) + "..." : description);

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <link rel="icon" type="image/x-icon" href="${baseUrl}/favicon.ico">
  <meta name="description" content="${safeDesc}">
  <meta property="og:type" content="${type}"><meta property="og:url" content="${url}">
  <meta property="og:title" content="${safeTitle}"><meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}"><meta name="twitter:image" content="${image}">
  <link rel="canonical" href="${url}">
  ${extraMeta}
  ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
  <meta http-equiv="refresh" content="0;url=${url}">
</head>
<body><p>Redirecting...</p><script>window.location.href="${url}";</script></body>
</html>`;
}

function generateProductHtml(product: any, shop: any, productUrl: string, baseUrl: string): string {
  const shopName = shop?.name || '';
  const titleText = shopName 
    ? `${product.seo_title || product.title} by ${shopName} – ${formatPrice(product.price)}`
    : `${product.seo_title || product.title} – ${formatPrice(product.price)}`;
  const rawDesc = product.seo_description || product.description || "Available on Smart Market.";
  const image = product.seo_image || product.images?.[0]?.startsWith('http') ? (product.seo_image || product.images[0]) : `${baseUrl}/og-image-v3.jpg`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.seo_title || product.title,
    "description": rawDesc.substring(0, 500),
    "image": [image],
    "url": productUrl,
    "sku": product.id,
    ...(shopName && { "brand": { "@type": "Brand", "name": shopName } }),
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": product.currency_code || "RWF",
      "availability": "https://schema.org/InStock",
      "url": productUrl,
      ...(shopName && { "seller": { "@type": "Organization", "name": shopName } }),
    }
  });

  return generateMetaHtml({
    title: `${titleText} | Smart Market`,
    description: rawDesc,
    image,
    url: productUrl,
    type: "product",
    baseUrl,
    extraMeta: `<meta property="product:price:amount" content="${product.price}"><meta property="product:price:currency" content="${product.currency_code || 'RWF'}"><meta property="og:image:alt" content="${escapeHtml(product.title)}">`,
    jsonLd,
  });
}

function generateReferralHtml(referrerName: string, code: string, baseUrl: string): string {
  return generateMetaHtml({
    title: `${referrerName} invited you to Smart Market!`,
    description: `Join Smart Market today and discover amazing deals near you! Buy, sell & rent products easily. Sign up with code ${code} and start shopping smarter. 🛒✨`,
    image: `${baseUrl}/og-image-v3.jpg`,
    url: `${baseUrl}/r/${code}`,
    baseUrl,
  });
}

function generateCategoryHtml(category: any, baseUrl: string): string {
  const title = category.seo_title || `${category.name} | Smart Market`;
  const description = category.seo_description || `Discover ${category.name} products and deals on Smart Market. Find high-quality items at the best prices.`;
  const image = category.seo_image?.startsWith('http') ? category.seo_image : `${baseUrl}/og-image-v3.jpg`;
  const url = `${baseUrl}/${category.slug}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": description.substring(0, 500),
    "url": url,
    "image": image,
    "isPartOf": { "@type": "WebSite", "name": "Smart Market", "url": baseUrl },
  });

  return generateMetaHtml({ title, description, image, url, baseUrl, jsonLd });
}

function generatePageHtml(page: any, baseUrl: string): string {
  const title = page.seo_title || `${page.title} | Smart Market`;
  const description = page.meta_description || `Learn more about ${page.title} at Smart Market.`;
  const image = page.seo_image?.startsWith('http') ? page.seo_image : `${baseUrl}/og-image-v3.jpg`;
  const url = `${baseUrl}/${page.slug}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": description.substring(0, 500),
    "url": url,
    "image": image,
    "isPartOf": { "@type": "WebSite", "name": "Smart Market", "url": baseUrl },
  });

  return generateMetaHtml({ title, description, image, url, baseUrl, jsonLd });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const categorySlug = url.searchParams.get("category");
    const pageSlug = url.searchParams.get("page");
    const referralCode = url.searchParams.get("referral");
    const userAgent = req.headers.get("user-agent");
    const baseUrl = "https://smart-market-online.vercel.app";
    const crawlerDetected = isCrawler(userAgent);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // ── Category OG preview ──
    if (categorySlug) {
      const appUrl = `${baseUrl}/${categorySlug}`;
      if (!crawlerDetected) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": appUrl } });
      }
      const { data: category } = await supabase
        .from("categories")
        .select("name, slug, seo_title, seo_description, seo_image")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (!category) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
      }
      const html = generateCategoryHtml(category, baseUrl);
      return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
    }

    // ── Site page OG preview ──
    if (pageSlug) {
      const appUrl = `${baseUrl}/${pageSlug}`;
      if (!crawlerDetected) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": appUrl } });
      }
      const { data: page } = await supabase
        .from("site_pages")
        .select("title, slug, seo_title, meta_description, seo_image")
        .eq("slug", pageSlug)
        .eq("is_published", true)
        .maybeSingle();
      if (!page) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
      }
      const html = generatePageHtml(page, baseUrl);
      return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
    }

    // ── Referral OG preview ──
    if (referralCode) {
      if (!crawlerDetected) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": `${baseUrl}/r/${referralCode}` } });
      }
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("referral_code", referralCode).maybeSingle();
      const html = generateReferralHtml(profile?.full_name || "a friend", referralCode, baseUrl);
      return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    }

    // ── Product OG preview ──
    if (!slug) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
    }

    if (!crawlerDetected) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": `${baseUrl}/product/${slug}` } });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let query = supabase.from("products")
      .select("id, title, description, price, images, slug, status, seo_title, seo_description, seo_image, currency_code, shop_id")
      .eq("status", "active");
    if (isUUID) query = query.eq("id", slug); else query = query.eq("slug", slug);

    const { data: product } = await query.maybeSingle();
    if (!product) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
    }

    let shop = null;
    if (product.shop_id) {
      const { data: shopData } = await supabase.from("shops").select("name, slug").eq("id", product.shop_id).maybeSingle();
      shop = shopData;
    }

    const productSlug = product.slug || product.id;
    const finalUrl = shop?.slug
      ? `${baseUrl}/products/${productSlug}/by/${shop.slug}`
      : `${baseUrl}/product/${productSlug}`;
    
    const html = generateProductHtml(product, shop, finalUrl, baseUrl);
    return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    console.error("[og-preview] Error:", error);
    return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": "https://smart-market-online.vercel.app" } });
  }
});
