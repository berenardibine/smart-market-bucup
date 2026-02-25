import { useEffect } from 'react';

interface ProductJsonLdProps {
  title: string;
  description: string;
  image: string;
  url: string;
  price?: number;
  currency?: string;
  seller?: string;
  location?: string;
  category?: string;
  availability?: string;
  sku?: string;
}

const ProductJsonLd = ({
  title,
  description,
  image,
  url,
  price,
  currency = 'RWF',
  seller,
  location,
  category,
  availability = 'InStock',
  sku,
}: ProductJsonLdProps) => {
  useEffect(() => {
    const fullImage = image?.startsWith('http') ? image : `https://smart-market-online.vercel.app${image || '/og-image-v3.jpg'}`;
    
    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: description?.substring(0, 500) || '',
      image: [fullImage],
      url,
      ...(category && { category }),
      ...(sku && { sku }),
      ...(seller && { brand: { '@type': 'Brand', name: seller } }),
      ...(price && {
        offers: {
          '@type': 'Offer',
          price: price.toString(),
          priceCurrency: currency,
          availability: `https://schema.org/${availability}`,
          url,
          ...(seller && {
            seller: {
              '@type': 'Organization',
              name: seller,
            },
          }),
          ...(location && {
            areaServed: {
              '@type': 'Place',
              name: location,
            },
          }),
        },
      }),
    };

    let script = document.querySelector('#product-jsonld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'product-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      script?.remove();
    };
  }, [title, description, image, url, price, currency, seller, location, category, availability, sku]);

  return null;
};

export default ProductJsonLd;
