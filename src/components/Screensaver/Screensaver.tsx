'use client';

import { useEffect, useRef, useState } from 'react';

// `tight` scales the bounce box down to compensate for transparent
// padding around the figure. The PNGs are now exported trimmed to the
// visible content, so 1 = pixels go to the PNG edge.
// `longEdge` overrides the default size for that image.
// `bounceModel`:
//   'ellipse' (default) — figure is roughly oval inside its PNG (e.g.
//     spread-limb characters). Bbox stays close to the PNG dims even at
//     45° rotation.
//   'rect' — figure fills its PNG rectangle. Use this when the silhouette
//     is more rectangular than oval; the rotated AABB grows on the
//     diagonal so the visible body bounces at the edge accurately.
const IMAGES = [
  { src: '/screensaver/astronaut-dog.webp', alt: 'Astronaut with dog', w: 292, h: 372, tight: 1, longEdge: 324, bounceModel: 'rect' },
  { src: '/screensaver/astronaut.webp', alt: 'Astronaut floating', w: 663, h: 672, tight: 0.85, longEdge: 520, bounceModel: 'ellipse' },
] as const;

const IDLE_MS = 60000; // 60s idle before the screensaver kicks in
const TARGET_LONG_EDGE = 360; // px — sizing the longer image side
const SPEED = 140; // px / second
const SPIN_DEG_PER_SEC = 18; // slow continuous rotation

// Below this viewport width the image scales by MOBILE_SCALE so the
// figure doesn't dominate small screens. Matches --breakpoint-md in
// tokens.css; keep in sync if that token changes.
const MOBILE_BREAKPOINT_PX = 828;
const MOBILE_SCALE = 0.5;

// User-activity events that reset the idle timer and dismiss the
// screensaver. Shared by the idle and dismiss effects.
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'wheel',
  'touchstart',
  'touchmove',
  'scroll',
];

/**
 * Every window to watch for activity: the top window plus any
 * same-origin iframes. Events inside an iframe (e.g. the Herc geofence
 * prototype) don't bubble to the parent, so the parent window alone
 * never sees interaction that happens over an embedded frame.
 */
function getActivityWindows(): Window[] {
  const wins: Window[] = [window];
  document.querySelectorAll('iframe').forEach((frame) => {
    try {
      // Reading contentDocument throws for cross-origin frames.
      if (frame.contentWindow && frame.contentDocument) {
        wins.push(frame.contentWindow);
      }
    } catch {
      /* cross-origin frame — not observable, skip */
    }
  });
  return wins;
}

/**
 * Binds `handler` to every activity event on the top window and all
 * same-origin iframes, keeping the binding correct as iframes load or
 * are added/removed by client-side navigation. Returns a cleanup fn.
 */
function watchActivity(handler: () => void): () => void {
  let bound: Window[] = [];

  const unbind = () => {
    bound.forEach((w) => {
      try {
        ACTIVITY_EVENTS.forEach((e) => w.removeEventListener(e, handler));
      } catch {
        /* frame window already torn down */
      }
    });
    bound = [];
  };

  const bind = () => {
    unbind();
    bound = getActivityWindows();
    bound.forEach((w) => {
      try {
        ACTIVITY_EVENTS.forEach((e) =>
          w.addEventListener(e, handler, { passive: true }),
        );
      } catch {
        /* cross-origin — skip */
      }
    });
  };

  // An iframe swaps its contentWindow when it loads, so re-bind on load.
  const onFrameLoad = () => bind();
  const attachFrameLoadListeners = () => {
    document.querySelectorAll('iframe').forEach((f) => {
      f.removeEventListener('load', onFrameLoad);
      f.addEventListener('load', onFrameLoad);
    });
  };

  bind();
  attachFrameLoadListeners();

  // Re-bind when an iframe is added or removed — project navigation
  // mounts and unmounts the Herc prototype iframe.
  const observer = new MutationObserver((records) => {
    const iframeChanged = records.some((record) =>
      [...record.addedNodes, ...record.removedNodes].some(
        (node) =>
          node.nodeName === 'IFRAME' ||
          (node instanceof Element && node.querySelector('iframe') !== null),
      ),
    );
    if (iframeChanged) {
      attachFrameLoadListeners();
      bind();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    document.querySelectorAll('iframe').forEach((f) =>
      f.removeEventListener('load', onFrameLoad),
    );
    unbind();
  };
}

/**
 * Site-wide DVD-bouncer screensaver. After `IDLE_MS` of no user input,
 * a black 80% overlay covers the page and a single image floats around,
 * ricocheting off the viewport edges. Each activation alternates the
 * image (astronaut → astronaut-dog → astronaut → …). Any interaction
 * dismisses it.
 *
 * State note: the alternating index lives in a ref so it survives the
 * unmount/remount cycle when the screensaver toggles, but resets on
 * full page reload (per Fátima's spec).
 */
export function Screensaver() {
  const [active, setActive] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  // Warm the browser cache with the screensaver images on mount. The
  // overlay's <img> is created only when the screensaver activates (60s
  // idle); without this it fetches lazily at that moment, and on a flaky
  // mobile connection that fetch can fail — leaving a broken-image
  // placeholder bouncing around. Preloading makes activation a cache hit.
  useEffect(() => {
    IMAGES.forEach(({ src }) => {
      const pre = new Image();
      pre.src = src;
    });
  }, []);

  // Idle detection — any input resets the timer; reaching IDLE_MS opens
  // the screensaver. watchActivity covers the top window and same-origin
  // iframes, so interaction over an embedded prototype counts too.
  useEffect(() => {
    let timer: number | undefined;
    const reset = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => setActive(true), IDLE_MS);
    };
    const stop = watchActivity(reset);
    reset();
    return () => {
      stop();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // When active, ANY input dismisses immediately and bumps the image
  // index so the next activation shows the other image. watchActivity
  // also catches input over iframes (e.g. the Herc geofence map).
  useEffect(() => {
    if (!active) return;
    const dismiss = () => {
      setActive(false);
      setImageIdx((i) => (i + 1) % IMAGES.length);
    };
    return watchActivity(dismiss);
  }, [active]);

  if (!active) return null;

  return <ScreensaverOverlay image={IMAGES[imageIdx]} />;
}

interface OverlayProps {
  image: (typeof IMAGES)[number];
}

function ScreensaverOverlay({ image }: OverlayProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  // Scaled dimensions — keep the longer side at the image's longEdge
  // (or the default TARGET_LONG_EDGE) so the motion box math stays in
  // viewport units regardless of the asset. On mobile the long edge is
  // halved (MOBILE_SCALE) so the figure doesn't dominate the screen.
  const baseLongEdge = (image as { longEdge?: number }).longEdge ?? TARGET_LONG_EDGE;
  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX;
  const longEdge = baseLongEdge * (isMobile ? MOBILE_SCALE : 1);
  const scale = longEdge / Math.max(image.w, image.h);
  const w = Math.round(image.w * scale);
  const h = Math.round(image.h * scale);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // Start somewhere in the middle, heading at a 30° angle so the
    // motion doesn't immediately hit a 90° corner reflection. Velocity
    // is in px/sec; rAF dt converts to per-frame displacement.
    const rad = (30 * Math.PI) / 180;
    let vx = Math.cos(rad) * SPEED;
    let vy = Math.sin(rad) * SPEED;
    let x = (window.innerWidth - w) / 2;
    let y = (window.innerHeight - h) / 2;
    let last = performance.now();
    let rot = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      x += vx * dt;
      y += vy * dt;
      rot = (rot + SPIN_DEG_PER_SEC * dt) % 360;
      // Compute the AABB of the currently-rotated image so the bounce
      // triggers on the visible bounds, not the un-rotated w/h. Rotation
      // is around the element center (transform-origin default), so the
      // rotated bbox is centered on (x + w/2, y + h/2) with size
      // (w·|cos| + h·|sin|, w·|sin| + h·|cos|).
      // Bounce box choice per image (see IMAGES.bounceModel):
      //   'ellipse' — inscribed-ellipse AABB (oval silhouette assumption)
      //   'rect' — rectangle AABB (figure fills its PNG rectangle)
      const rad = (rot * Math.PI) / 180;
      const tight = image.tight;
      let bbW: number;
      let bbH: number;
      if (image.bounceModel === 'rect') {
        const c = Math.abs(Math.cos(rad));
        const s = Math.abs(Math.sin(rad));
        bbW = (w * c + h * s) * tight;
        bbH = (w * s + h * c) * tight;
      } else {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const a = w / 2;
        const b = h / 2;
        bbW = 2 * Math.sqrt(a * a * c * c + b * b * s * s) * tight;
        bbH = 2 * Math.sqrt(a * a * s * s + b * b * c * c) * tight;
      }
      const minX = x + w / 2 - bbW / 2;
      const maxX = x + w / 2 + bbW / 2;
      const minY = y + h / 2 - bbH / 2;
      const maxY = y + h / 2 + bbH / 2;
      if (minX <= 0) {
        x = (bbW - w) / 2;
        vx = Math.abs(vx);
      } else if (maxX >= window.innerWidth) {
        x = window.innerWidth - (bbW + w) / 2;
        vx = -Math.abs(vx);
      }
      if (minY <= 0) {
        y = (bbH - h) / 2;
        vy = Math.abs(vy);
      } else if (maxY >= window.innerHeight) {
        y = window.innerHeight - (bbH + h) / 2;
        vy = -Math.abs(vy);
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      // Clamp into the new viewport so the image doesn't end up off-screen.
      x = Math.min(x, Math.max(0, window.innerWidth - w));
      y = Math.min(y, Math.max(0, window.innerHeight - h));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [w, h]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <img
        ref={imgRef}
        src={image.src}
        alt={image.alt}
        width={w}
        height={h}
        className="absolute top-0 left-0"
        style={{ willChange: 'transform' }}
        draggable={false}
      />
    </div>
  );
}
