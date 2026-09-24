import { useEffect } from 'react';

export default function SEO({ title, description }) {
  useEffect(() => {
    // Set page title
    const fullTitle = title
      ? `${title} | Rajwada Sarees Wholesale`
      : 'Rajwada Sarees | Premium Wholesale & Bulk Saree Manufacturer';
    document.title = fullTitle;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descText = description || 'Premier B2B wholesale saree manufacturer supplying Kanjivaram silk, Banarasi brocades, Chanderi cotton, and designer organza sarees at direct loom prices.';
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descText);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descText;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
}
