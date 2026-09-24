import { useEffect } from 'react';

export default function SEO({ title, description }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Rajwada Sarees Wholesale`
      : 'Rajwada Sarees | Premium Wholesale & Bulk Saree Manufacturer';

    document.title = fullTitle;

    const descText =
      description ||
      'Premier B2B wholesale saree manufacturer supplying Kanjivaram silk, Banarasi brocades, Chanderi cotton, and designer organza sarees at direct loom prices.';

    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute('content', descText);
  }, [title, description]);

  return null;
}