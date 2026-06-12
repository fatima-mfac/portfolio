import type { MetadataRoute } from 'next';

// Required for `output: 'export'` — marks this metadata route static
// so Next emits a plain sitemap.xml file at build time.
export const dynamic = 'force-static';

const SITE_URL = 'https://fatimacunha.com';

/**
 * Sitemap — generated to a static sitemap.xml at build time (compatible
 * with `output: 'export'`). Lists the section routes plus the three
 * standalone case studies. Zebra Finch still lives on `/` behind a
 * `?project=` query param, so it has no own URL to list.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/work`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/patina`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/vodafone`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/herc`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
