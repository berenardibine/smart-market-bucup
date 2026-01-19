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
  
  // Use product image or fallback to a dynamic preview
  const productImage = product.images?.[0];
  const image = productImage && productImage.startsWith('http') 
    ? productImage 
    : `${baseUrl}/og-image.png`;
  
  const siteName = "Smart Market — Buy Smart, Live Smart";
  const faviconUrl = `${baseUrl}/favicon.ico`;

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Smart Market</title>
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="${faviconUrl}">
  <link rel="shortcut icon" href="${faviconUrl}">
  
  <!-- Standard Meta Tags -->
  <meta name="description" content="${shortDescription}">
  <meta name="author" content="Smart Market">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${shortDescription}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.title)}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="en_US">
  
  <!-- Product specific OG tags -->
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="RWF">
  <meta property="product:availability" content="in stock">
  <meta property="product:condition" content="new">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${productUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${shortDescription}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(product.title)}">
  <meta name="twitter:site" content="@SmartMarketApp">
  
  <!-- WhatsApp specific enhancements -->
  <meta property="og:updated_time" content="${new Date().toISOString()}">
  
  <!-- Redirect for browsers (non-crawlers) -->
  <meta http-equiv="refresh" content="0;url=${productUrl}">
  <link rel="canonical" href="${productUrl}">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #fff5eb 0%, #ffffff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .image-container {
      position: relative;
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
    }
    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: linear-gradient(135deg, #FF7B00 0%, #FF9500 100%);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(255, 123, 0, 0.3);
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .price {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #FF7B00 0%, #FF5500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }
    .description {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #FF7B00 0%, #FF9500 100%);
      color: white;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(255, 123, 0, 0.25);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(255, 123, 0, 0.35);
    }
    .footer {
      text-align: center;
      padding: 16px;
      background: #fafafa;
      color: #999;
      font-size: 13px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="image-container">
      <img src="${image}" alt="${escapeHtml(product.title)}" class="image" onerror="this.src='${baseUrl}/og-image.png'">
      <span class="badge">🛒 Smart Market</span>
    </div>
    <div class="content">
      <h1 class="title">${escapeHtml(product.title)}</h1>
      <p class="price">${formatPrice(product.price)}</p>
      <p class="description">${shortDescription}</p>
      <a href="${productUrl}" class="cta">
        View Product →
      </a>
    </div>
    <div class="footer">
      <span class="logo">🛍️ Smart Market — Buy Smart, Live Smart</span>
    </div>
  </div>
  <script>window.location.href = "${productUrl}";</script>
</body>
</html>`;
}

function generateNotFoundHtml(baseUrl: string): string {
  const faviconUrl = `${baseUrl}/favicon.ico`;
  const ogImage = `${baseUrl}/og-image.png`;
  
  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Market — Buy Smart, Live Smart</title>
  
  <link rel="icon" type="image/x-icon" href="${faviconUrl}">
  
  <meta property="og:title" content="Smart Market — Buy Smart, Live Smart">
  <meta property="og:description" content="Discover quality products near you. Your digital marketplace for buying and selling.">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Smart Market">
  <meta property="og:type" content="website">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Smart Market — Buy Smart, Live Smart">
  <meta name="twitter:description" content="Discover quality products near you.">
  <meta name="twitter:image" content="${ogImage}">
  
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

    console.log(`[og-preview] Request for slug: ${slug}, User-Agent: ${userAgent?.substring(0, 50)}...`);
    
    const crawlerDetected = isCrawler(userAgent);
    console.log(`[og-preview] Is crawler: ${crawlerDetected}`);

    // If no slug provided, redirect to home
    if (!slug) {
      console.log("[og-preview] No slug provided, redirecting to home");
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": baseUrl },
      });
    }

    // For non-crawler browsers, immediately redirect to product page
    if (!crawlerDetected) {
      const redirectUrl = `${baseUrl}/product/${slug}`;
      console.log(`[og-preview] Non-crawler detected, redirecting to: ${redirectUrl}`);
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": redirectUrl },
      });
    }

    // Initialize Supabase client (only for crawlers)
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
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": baseUrl },
      });
    }

    if (!product) {
      console.log("[og-preview] Product not found");
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": baseUrl },
      });
    }

    // Generate the correct product URL (prefer slug over ID)
    const finalProductUrl = product.slug 
      ? `${baseUrl}/product/${product.slug}`
      : `${baseUrl}/product/${product.id}`;

    console.log(`[og-preview] Crawler detected, serving OG meta for: ${product.title}`);

    // Generate HTML with meta tags for crawlers
    const html = generateHtml(product, finalProductUrl, baseUrl);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[og-preview] Error:", error);
    const baseUrl = "https://smart-market-online.vercel.app";
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, "Location": baseUrl },
    });
  }
});
