import type { NextConfig } from 'next';

const PROJECT_SLUGS = ['patina', 'vodafone', 'zebra-finch', 'herc-rentals'];

const nextConfig: NextConfig = {
  images: {
    // TEMPORARY — iterating on image assets. Skips Next's optimizer so
    // updated files in /public refresh instantly. Re-enable optimization
    // (delete the `unoptimized` line) before merging / shipping so
    // production gets the smaller, format-converted variants.
    unoptimized: true,
    // Allow the higher-quality variants used by FillImage's zoomed shots
    // (Next 14+ requires non-default `quality` props to be allowlisted).
    qualities: [75, 92],
  },
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
