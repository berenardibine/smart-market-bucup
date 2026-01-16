import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// List of known social media crawler user agents
const CRAWLER_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "LinkedInBot",
  "Twitterbot",
  "WhatsApp",
  "TelegramBot",
  "Slackbot",
  "Discordbot",
  "Pinterest",
  "vkShare",
  "W3C_Validator",
  "redditbot",
  "Applebot",
  "bingbot",
  "Googlebot",
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some((crawler) =>
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateHtml(product: any, productUrl: string, baseUrl: string): string {
  const title = escapeHtml(`${product.title} – ${formatPrice(product.price)}`);
  const shortDescription = escapeHtml(
    product.description?.length > 150
      ? product.description.substring(0, 147) + "..."
      : product.description || "Available on Smart Market. Buy Smart, Live Smart."
  );
  const image = product.images?.[0] || `${baseUrl}/placeholder.svg`;
  const siteName = "Smart Market — Buy Smart, Live Smart";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Smart Market</title>
  
  <!-- Standard Meta Tags -->
  <meta name="description" content="${shortDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${shortDescription}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="RWF">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${productUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${shortDescription}">
  <meta name="twitter:image" content="${image}">
  
  <!-- WhatsApp specific -->
  <meta property="og:image:alt" content="${escapeHtml(product.title)}">
  
  <!-- Redirect for browsers (non-crawlers) -->
  <meta http-equiv="refresh" content="0;url=${productUrl}">
  <link rel="canonical" href="${productUrl}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #fff5eb 0%, #ffffff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .card {
      max-width: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .image {
      width: 100%;
      height: 280px;
      object-fit: cover;
      background: #f5f5f5;
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px;
    }
    .price {
      font-size: 28px;
      font-weight: 700;
      color: #FF7B00;
      margin: 0 0 12px;
    }
    .description {
      color: #666;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #FF7B00 0%, #FF9500 100%);
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
    }
    .footer {
      text-align: center;
      padding: 16px;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${image}" alt="${escapeHtml(product.title)}" class="image" onerror="this.src='${baseUrl}/placeholder.svg'">
    <div class="content">
      <h1 class="title">${escapeHtml(product.title)}</h1>
      <p class="price">${formatPrice(product.price)}</p>
      <p class="description">${shortDescription}</p>
      <a href="${productUrl}" class="badge">View on Smart Market →</a>
    </div>
    <div class="footer">
      Smart Market — Buy Smart, Live Smart 🛒
    </div>
  </div>
  <script>
    // Redirect immediately for non-crawlers
    window.location.href = "${productUrl}";
  </script>
</body>
</html>`;
}

function generateNotFoundHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Not Found | Smart Market</title>
  <meta property="og:title" content="Smart Market — Buy Smart, Live Smart">
  <meta property="og:description" content="Discover quality products near you on Smart Market.">
  <meta property="og:image" content="${baseUrl}/placeholder.svg">
  <meta property="og:site_name" content="Smart Market">
  <meta http-equiv="refresh" content="0;url=${baseUrl}">
</head>
<body>
  <script>window.location.href = "${baseUrl}";</script>
  <p>Redirecting to Smart Market...</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const userAgent = req.headers.get("user-agent");
    
    // Get base URL for the frontend app
    const baseUrl = "https://smart-market-online.vercel.app";
    const productPageUrl = slug ? `${baseUrl}/product/${slug}` : baseUrl;

    console.log(`[og-preview] Request for slug: ${slug}, User-Agent: ${userAgent?.substring(0, 50)}...`);
    console.log(`[og-preview] Is crawler: ${isCrawler(userAgent)}`);

    // If no slug provided, redirect to home
    if (!slug) {
      console.log("[og-preview] No slug provided, redirecting to home");
      return new Response(generateNotFoundHtml(baseUrl), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch product by slug or ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let query = supabase
      .from("products")
      .select("id, title, description, price, images, slug, status")
      .eq("status", "active");

    if (isUUID) {
      query = query.eq("id", slug);
    } else {
      query = query.eq("slug", slug);
    }

    const { data: product, error } = await query.maybeSingle();

    if (error) {
      console.error("[og-preview] Database error:", error);
      return new Response(generateNotFoundHtml(baseUrl), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (!product) {
      console.log("[og-preview] Product not found");
      return new Response(generateNotFoundHtml(baseUrl), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Generate the correct product URL (prefer slug over ID)
    const finalProductUrl = product.slug 
      ? `${baseUrl}/product/${product.slug}`
      : `${baseUrl}/product/${product.id}`;

    console.log(`[og-preview] Found product: ${product.title}, generating preview HTML`);

    // Generate HTML with meta tags
    const html = generateHtml(product, finalProductUrl, baseUrl);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("[og-preview] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
