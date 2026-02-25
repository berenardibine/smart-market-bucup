import { useEffect } from 'react';

interface PageMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
  siteName?: string;
}

const BASE_URL = 'https://smart-market-online.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image-v3.jpg`;

const PageMetaTags = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Smart Market',
}: PageMetaTagsProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const shortDesc = description?.length > 155 ? description.substring(0, 152) + '...' : (description || '');
    const fullImage = image?.startsWith('http') ? image : (image ? `${BASE_URL}${image}` : DEFAULT_IMAGE);
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    setMeta('name', 'description', shortDesc);

    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', shortDesc);
    setMeta('property', 'og:image', fullImage);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:site_name', siteName);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', shortDesc);
    setMeta('name', 'twitter:image', fullImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    return () => {
      document.title = 'Smart Market — Buy Smart, Live Smart';
    };
  }, [title, description, image, url, type, siteName]);

  return null;
};

export default PageMetaTags;
