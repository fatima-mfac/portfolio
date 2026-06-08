'use client';

import { useEffect, useRef } from 'react';

/**
 * Patina "smoke" shader — the live screen-time tint animation from the Patina
 * app, ported to WebGL2 (the AGSL shader translated 1:1; GLSL's bottom-left
 * origin is flipped once). A soft-edged rounded box of smoke drifts and cycles
 * colour neutral → yellow → orange → red on a 10s loop.
 *
 * Renders into a transparent, premultiplied-alpha canvas so the container's
 * cream gradient shows through. Self-contained: own rAF loop, pauses when
 * scrolled out of view (IntersectionObserver), renders a single static frame
 * under reduced-motion, and releases the GL context on unmount.
 */
export function SmokeCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return; // WebGL2 unsupported → the gradient backdrop stays

    const vs = `#version 300 es
      in vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const fs = `#version 300 es
      precision highp float;
      out vec4 outColor;

      uniform vec2  uResolution;
      uniform float uTime;
      uniform vec4  uColor;
      uniform float uIntensity;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(p);
          p *= 2.1;
          amplitude *= 0.45;
        }
        return value;
      }
      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        uv.y = 1.0 - uv.y;                 // AGSL is top-left origin; flip once
        uv.x = 1.0 - uv.x;                 // flip horizontally
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= aspect;

        vec2 center = vec2(0.0, 0.0);
        vec2 pLocal = p - center;

        float taper = 1.0 + pLocal.x * 0.35;
        pLocal.y *= taper;

        // Box width is fixed (not aspect-scaled) so the blob keeps its
        // rounded proportions regardless of the panel's aspect ratio — a
        // portrait panel no longer squeezes it into a thin vertical sliver.
        vec2 boxSize = vec2(0.187, 0.1935);
        float cornerRadius = 0.19;
        float d = sdRoundBox(pLocal, boxSize, cornerRadius);

        float edgeMask = smoothstep(-0.21, 0.02, d);
        float coreMask = 1.0 - edgeMask;
        float glowMask = 1.0 - smoothstep(-0.16, 0.16, d);

        float rimTime = uTime * 0.006;
        vec2 rimDrift = vec2(rimTime, rimTime * 0.3);

        float coreTime = uTime * 0.045;
        float wavy = sin(coreTime * 1.5 + p.y * 2.0) * 0.1;
        vec2 coreDrift = vec2(-coreTime + wavy, -coreTime * 0.3);

        float rimNoise = fbm(p * 2.0 + rimDrift);
        float grain = hash(uv * 1000.0 + uTime * 0.1);
        float rimPatina = mix(rimNoise, grain * 0.175 + rimNoise * 0.825, uIntensity);

        vec2 q = vec2(fbm(p + coreDrift), fbm(p + vec2(5.2, 1.3) - coreDrift));
        vec2 r = vec2(fbm(p + 4.0 * q + coreDrift * 1.2), fbm(p + 4.0 * q - coreDrift * 0.8));
        float coreSmoke = fbm(p + 4.0 * r);
        coreSmoke = smoothstep(0.08, 0.62, coreSmoke);
        // Lift the noise onto a high floor so the body reads as one evenly
        // dense mass with only subtle internal mottling, instead of wispy
        // holes that let the cream show through.
        coreSmoke = 0.55 + 0.45 * coreSmoke;

        float rimAlpha = rimPatina * edgeMask * 1.0;
        float coreAlpha = coreSmoke * coreMask * 1.0;

        float finalAlpha = (rimAlpha + coreAlpha) * glowMask * uColor.a;
        finalAlpha = clamp(finalAlpha * 1.4, 0.0, 1.0);

        outColor = vec4(uColor.rgb * finalAlpha, finalAlpha); // premultiplied
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vShader = compile(gl.VERTEX_SHADER, vs);
    const fShader = compile(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Fullscreen triangle (cheaper than a quad, no seam).
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(prog, 'uResolution');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uColor = gl.getUniformLocation(prog, 'uColor');
    const uIntensity = gl.getUniformLocation(prog, 'uIntensity');

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // 10s colour cycle: neutral → yellow → orange → red → neutral.
    const stops = [
      [0.992, 0.91, 0.631], // #FDE8A1 neutral
      [1.0, 0.776, 0.161], // #FFC629 yellow
      [1.0, 0.502, 0.0], // #FF8000 orange
      [1.0, 0.231, 0.188], // #FF3B30 red
    ];
    const cycleMs = 18_000;
    // Weighted timeline: hold each colour, then transition to the next. The
    // darker colours are held progressively longer (yellow < orange < red) and
    // neutral barely holds, so the cycle dwells in the warm/dark range.
    // Each segment is [fromStop, toStop, weight]; from == to is a hold.
    const segments: Array<[number, number, number]> = [
      [0, 0, 0.3], // neutral — brief hold
      [0, 1, 0.8], // → yellow
      [1, 1, 1.0], // yellow hold
      [1, 2, 0.8], // → orange
      [2, 2, 1.4], // orange hold (longer)
      [2, 3, 0.8], // → red
      [3, 3, 2.0], // red hold (longest)
      [3, 0, 1.0], // → neutral
    ];
    const totalWeight = segments.reduce((sum, seg) => sum + seg[2], 0);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const colorAt = (ms: number): [number, number, number] => {
      let pos = ((ms % cycleMs) / cycleMs) * totalWeight;
      let idx = 0;
      while (idx < segments.length - 1 && pos >= segments[idx][2]) {
        pos -= segments[idx][2];
        idx++;
      }
      const [from, to, w] = segments[idx];
      const k = w > 0 ? Math.min(1, pos / w) : 0;
      const a = stops[from];
      const b = stops[to];
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const render = (elapsedMs: number) => {
      resize();
      const [r, g, b] = colorAt(elapsedMs);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsedMs / 1000); // 1 unit per second, matches AGSL
      gl.uniform4f(uColor, r, g, b, 0.85);
      gl.uniform1f(uIntensity, 1.0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf = 0;
    let running = false;

    const loop = (now: number) => {
      render(now - start);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stopLoop = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Pause the GPU loop while the panel is off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { rootMargin: '200px' },
    );
    io.observe(canvas);

    // Always paint at least one frame (covers reduced-motion + first paint).
    render(reduced ? 2500 : 0);

    return () => {
      stopLoop();
      io.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
