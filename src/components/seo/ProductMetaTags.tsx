import { useEffect } from 'react';

interface ProductMetaTagsProps {
  title: string;
  description: string;
  image: string;
  url: string;
  price?: number;
  siteName?: string;
}

const ProductMetaTags = ({ 
  title, 
  description, 
  image, 
  url, 
  price,
  siteName = 'Smart Market — Buy Smart, Live Smart'
}: ProductMetaTagsProps) => {
  useEffect(() => {
    // Update document title
    const formattedTitle = price 
      ? `${title} – Fr ${price.toLocaleString()} | Smart Market`
      : `${title} | Smart Market`;
    document.title = formattedTitle;
    
    // Helper to set or update meta tag
    const setMetaTag = (property: string, content: string, isOg = true) => {
      const attr = isOg ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Truncate description to 150 chars
    const shortDescription = description.length > 150 
      ? description.substring(0, 147) + '...'
      : description;
    
    // Ensure image has full URL
    const fullImageUrl = image.startsWith('http') 
      ? image 
      : `https://smart-market-online.vercel.app${image}`;
    
    // Set Open Graph tags
    setMetaTag('og:title', price ? `${title} – Fr ${price.toLocaleString()}` : title);
    setMetaTag('og:description', shortDescription || 'Available on Smart Market. Buy Smart, Live Smart.');
    setMetaTag('og:image', fullImageUrl);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'product');
    setMetaTag('og:site_name', siteName);
    setMetaTag('og:image:alt', title);
    
    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', `${title} – Smart Market`, false);
    setMetaTag('twitter:description', shortDescription || 'Discover quality products on Smart Market.', false);
    setMetaTag('twitter:image', fullImageUrl, false);
    setMetaTag('twitter:url', url, false);
    
    // Set standard meta tags
    setMetaTag('description', shortDescription, false);
    
    // Set product specific tags if price exists
    if (price) {
      setMetaTag('product:price:amount', price.toString());
      setMetaTag('product:price:currency', 'RWF');
    }
    
    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
    // Cleanup on unmount
    return () => {
      document.title = 'Smart Market — Buy Smart, Live Smart';
    };
  }, [title, description, image, url, price, siteName]);
  
  return null;
};

export default ProductMetaTags;
