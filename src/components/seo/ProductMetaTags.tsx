import { useEffect } from 'react';

interface ProductMetaTagsProps {
  title: string;
  description: string;
  image: string;
  url: string;
  price?: number;
}

const ProductMetaTags = ({ title, description, image, url, price }: ProductMetaTagsProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Smart Market Rwanda`;
    
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
    
    // Set Open Graph tags
    setMetaTag('og:title', title);
    setMetaTag('og:description', shortDescription);
    setMetaTag('og:image', image);
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'product');
    setMetaTag('og:site_name', 'Smart Market Rwanda');
    
    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', title, false);
    setMetaTag('twitter:description', shortDescription, false);
    setMetaTag('twitter:image', image, false);
    
    // Set standard meta tags
    setMetaTag('description', shortDescription, false);
    
    // Set product specific tags if price exists
    if (price) {
      setMetaTag('product:price:amount', price.toString());
      setMetaTag('product:price:currency', 'RWF');
    }
    
    // Cleanup on unmount
    return () => {
      document.title = 'Smart Market Rwanda';
    };
  }, [title, description, image, url, price]);
  
  return null;
};

export default ProductMetaTags;
