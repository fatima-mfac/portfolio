import type { NextConfig } from 'next';

const PROJECT_SLUGS = ['patina', 'vodafone', 'zebra-finch', 'herc-rentals'];

const nextConfig: NextConfig = {
  /**
   * Legacy use-case URLs (/patina, /vodafone, …) used to be standalone routes
   * before the right column became state-driven. Redirect them to the new
   * query-based form so old links and bookmarks keep working.
   */
  async redirects() {
    return PROJECT_SLUGS.map((slug) => ({
      source: `/${slug}`,
      destination: `/?project=${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
