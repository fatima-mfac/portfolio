import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static HTML export — the whole site is static content, so it ships
  // as plain HTML/CSS/JS (build output in `out/`), with no server
  // runtime. Deploys to any static host (Cloudflare Pages).
  //
  // The legacy /patina, /vodafone, … → /?project=… redirects can't use
  // Next's redirects() here — it's unsupported under `output: 'export'`.
  // They live in the Cloudflare `_redirects` file at public/_redirects.
  output: 'export',
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    // Required by `output: 'export'` — Next's on-demand image optimizer
    // needs a server, which a static export doesn't have. Source images
    // are served as-is; pre-compress them if file size matters.
    unoptimized: true,
    // Allow the higher-quality variants used by FillImage's zoomed shots
    // (Next 14+ requires non-default `quality` props to be allowlisted).
    qualities: [75, 92],
  },
};

export default nextConfig;
