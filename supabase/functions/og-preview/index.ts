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

function generateProductHtml(product: any, productUrl: string, baseUrl: string): string {
  const title = escapeHtml(`${product.title} – ${formatPrice(product.price)}`);
  const shortDescription = escapeHtml(
    product.description?.length > 150 ? product.description.substring(0, 147) + "..." : product.description || "Available on Smart Market."
  );
  const image = product.images?.[0]?.startsWith('http') ? product.images[0] : `${baseUrl}/og-image.jpg`;
  const siteName = "Smart Market — Buy Smart, Live Smart";

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Smart Market</title>
  <link rel="icon" type="image/x-icon" href="${baseUrl}/favicon.ico">
  <meta name="description" content="${shortDescription}">
  <meta property="og:type" content="product"><meta property="og:url" content="${productUrl}">
  <meta property="og:title" content="${title}"><meta property="og:description" content="${shortDescription}">
  <meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.title)}"><meta property="og:site_name" content="${siteName}">
  <meta property="product:price:amount" content="${product.price}"><meta property="product:price:currency" content="RWF">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${shortDescription}"><meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${productUrl}"><link rel="canonical" href="${productUrl}">
</head>
<body><p>Redirecting...</p><script>window.location.href="${productUrl}";</script></body>
</html>`;
}

function generateReferralHtml(referrerName: string, code: string, baseUrl: string): string {
  const title = escapeHtml(`Join Smart Market — Support ${referrerName}!`);
  const description = escapeHtml(`Use referral code ${code} to get priority features. Buy Smart, Live Smart.`);
  const image = `${baseUrl}/og-image.jpg`;
  const url = `${baseUrl}/r/${code}`;

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="icon" type="image/x-icon" href="${baseUrl}/favicon.ico">
  <meta name="description" content="${description}">
  <meta property="og:type" content="website"><meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Smart Market — Buy Smart, Live Smart">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="${url}">
</head>
<body><p>Redirecting to Smart Market...</p><script>window.location.href="${url}";</script></body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const referralCode = url.searchParams.get("referral");
    const userAgent = req.headers.get("user-agent");
    const baseUrl = "https://smart-market-online.vercel.app";
    const crawlerDetected = isCrawler(userAgent);

    // Handle referral link OG preview
    if (referralCode) {
      if (!crawlerDetected) {
        return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": `${baseUrl}/r/${referralCode}` } });
      }

      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("referral_code", referralCode).maybeSingle();
      
      const html = generateReferralHtml(profile?.full_name || "a friend", referralCode, baseUrl);
      return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
    }

    // Handle product slug
    if (!slug) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
    }

    if (!crawlerDetected) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": `${baseUrl}/product/${slug}` } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let query = supabase.from("products").select("id, title, description, price, images, slug, status").eq("status", "active");
    if (isUUID) query = query.eq("id", slug); else query = query.eq("slug", slug);

    const { data: product } = await query.maybeSingle();
    if (!product) {
      return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": baseUrl } });
    }

    const finalUrl = product.slug ? `${baseUrl}/product/${product.slug}` : `${baseUrl}/product/${product.id}`;
    const html = generateProductHtml(product, finalUrl, baseUrl);
    return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    console.error("[og-preview] Error:", error);
    return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": "https://smart-market-online.vercel.app" } });
  }
});
