import type { MetadataRoute } from 'next';

// Required for `output: 'export'` — marks this metadata route static
// so Next emits a plain robots.txt file at build time.
export const dynamic = 'force-static';

/**
 * robots.txt — generated to a static file at build time (compatible
 * with `output: 'export'`). Allows all crawlers and points to the
 * sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://fatimacunha.com/sitemap.xml',
  };
}
