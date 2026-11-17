/**
 * Pixel filters for the photo enhancer. Planes are Float32 RGB in 0–255,
 * row-major, with no alpha. Blurs are separable box filters (two passes
 * approximate a Gaussian) so large photos stay interactive.
 */

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

export function yieldToMain() {
  const root = typeof window !== 'undefined' ? window : undefined;
  const schedulerApi = root && root.scheduler;
  if (schedulerApi && typeof schedulerApi.yield === 'function') {
    return schedulerApi.yield();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function clonePlane(src) {
  return Float32Array.from(src);
}

/**
 * Sliding-window box blur. Edge pixels are repeated so the window size stays
 * constant. `onFraction` is called with 0–1 as rows and columns complete.
 */
export async function boxBlurRGB(r, g, b, width, height, radius, onFraction) {
  const rad = Math.round(radius);
  if (rad < 1 || width < 2 || height < 2) {
    if (onFraction) onFraction(1);
    return [clonePlane(r), clonePlane(g), clonePlane(b)];
  }

  const n = width * height;
  const rH = new Float32Array(n);
  const gH = new Float32Array(n);
  const bH = new Float32Array(n);
  const inv = 1 / (rad * 2 + 1);
  let deadline = performance.now() + 50;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    for (let k = -rad; k <= rad; k += 1) {
      const x = k < 0 ? 0 : k >= width ? width - 1 : k;
      sumR += r[row + x];
      sumG += g[row + x];
      sumB += b[row + x];
    }
    for (let x = 0; x < width; x += 1) {
      rH[row + x] = sumR * inv;
      gH[row + x] = sumG * inv;
      bH[row + x] = sumB * inv;
      const removeX = x - rad;
      const addX = x + rad + 1;
      const ri = row + (removeX < 0 ? 0 : removeX);
      const ai = row + (addX >= width ? width - 1 : addX);
      sumR += r[ai] - r[ri];
      sumG += g[ai] - g[ri];
      sumB += b[ai] - b[ri];
    }
    if (performance.now() >= deadline) {
      if (onFraction) onFraction((y / height) * 0.5);
      // eslint-disable-next-line no-await-in-loop
      await yieldToMain();
      deadline = performance.now() + 50;
    }
  }

  const rV = new Float32Array(n);
  const gV = new Float32Array(n);
  const bV = new Float32Array(n);

  for (let x = 0; x < width; x += 1) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    for (let k = -rad; k <= rad; k += 1) {
      const y = k < 0 ? 0 : k >= height ? height - 1 : k;
      const i = y * width + x;
      sumR += rH[i];
      sumG += gH[i];
      sumB += bH[i];
    }
    for (let y = 0; y < height; y += 1) {
      const i = y * width + x;
      rV[i] = sumR * inv;
      gV[i] = sumG * inv;
      bV[i] = sumB * inv;
      const removeY = y - rad;
      const addY = y + rad + 1;
      const ri = (removeY < 0 ? 0 : removeY) * width + x;
      const ai = (addY >= height ? height - 1 : addY) * width + x;
      sumR += rH[ai] - rH[ri];
      sumG += gH[ai] - gH[ri];
      sumB += bH[ai] - bH[ri];
    }
    if ((x & 31) === 0 && performance.now() >= deadline) {
      if (onFraction) onFraction(0.5 + (x / width) * 0.5);
      // eslint-disable-next-line no-await-in-loop
      await yieldToMain();
      deadline = performance.now() + 50;
    }
  }

  if (onFraction) onFraction(1);
  return [rV, gV, bV];
}

async function smoothRGB(r, g, b, width, height, radius, onFraction) {
  const mid = await boxBlurRGB(r, g, b, width, height, radius, (fraction) => {
    if (onFraction) onFraction(fraction * 0.5);
  });
  return boxBlurRGB(mid[0], mid[1], mid[2], width, height, radius, (fraction) => {
    if (onFraction) onFraction(0.5 + fraction * 0.5);
  });
}

function lumaAt(r, g, b, i) {
  return LUMA_R * r[i] + LUMA_G * g[i] + LUMA_B * b[i];
}

/**
 * Pull flat areas slightly toward a small blur and leave edges alone,
 * so the later sharpen does not amplify grain.
 */
export async function denoiseMild(r, g, b, width, height, onFraction) {
  const [br, bg, bb] = await smoothRGB(r, g, b, width, height, 1, onFraction);
  const n = r.length;
  const or = new Float32Array(n);
  const og = new Float32Array(n);
  const ob = new Float32Array(n);
  const strength = 0.45;
  const edge = 8;

  for (let i = 0; i < n; i += 1) {
    const diff = Math.abs(lumaAt(r, g, b, i) - lumaAt(br, bg, bb, i));
    const edgeWeight = Math.min(1, diff / edge);
    const keep = 1 - strength * (1 - edgeWeight);
    const blend = 1 - keep;
    or[i] = r[i] * keep + br[i] * blend;
    og[i] = g[i] * keep + bg[i] * blend;
    ob[i] = b[i] * keep + bb[i] * blend;
  }

  return [or, og, ob];
}

/** Widen the gap between each pixel and a wide local average (clarity). */
export async function localContrast(r, g, b, width, height, onFraction) {
  const radius = Math.max(4, Math.min(28, Math.round(Math.min(width, height) / 36)));
  const amount = 0.55;
  const [br, bg, bb] = await smoothRGB(r, g, b, width, height, radius, onFraction);
  const n = r.length;
  const or = new Float32Array(n);
  const og = new Float32Array(n);
  const ob = new Float32Array(n);

  for (let i = 0; i < n; i += 1) {
    const delta = (lumaAt(r, g, b, i) - lumaAt(br, bg, bb, i)) * amount;
    or[i] = r[i] + delta;
    og[i] = g[i] + delta;
    ob[i] = b[i] + delta;
  }

  return [or, og, ob];
}

function sharpenSample(src, blur, amount, threshold, cap) {
  const diff = src - blur;
  const absDiff = diff < 0 ? -diff : diff;
  if (absDiff < threshold) return src;
  let delta = amount * diff;
  if (delta > cap) delta = cap;
  else if (delta < -cap) delta = -cap;
  return src + delta;
}

export async function unsharpMask(r, g, b, width, height, options, onFraction) {
  const radius = options.radius;
  const amount = options.amount;
  const threshold = options.threshold;
  const cap = options.cap == null ? 64 : options.cap;
  const [br, bg, bb] = await smoothRGB(r, g, b, width, height, radius, onFraction);
  const n = r.length;
  const or = new Float32Array(n);
  const og = new Float32Array(n);
  const ob = new Float32Array(n);

  for (let i = 0; i < n; i += 1) {
    or[i] = sharpenSample(r[i], br[i], amount, threshold, cap);
    og[i] = sharpenSample(g[i], bg[i], amount, threshold, cap);
    ob[i] = sharpenSample(b[i], bb[i], amount, threshold, cap);
  }

  return [or, og, ob];
}

function curve(value) {
  let n = value / 255;
  n = (n - 0.5) * 1.07 + 0.5;
  n += 0.035 * Math.sin((n - 0.5) * Math.PI);
  if (n < 0) return 0;
  if (n > 1) return 255;
  return n * 255;
}

export function contrastCurve(r, g, b) {
  const n = r.length;
  for (let i = 0; i < n; i += 1) {
    r[i] = curve(r[i]);
    g[i] = curve(g[i]);
    b[i] = curve(b[i]);
  }
}

/**
 * Denoise, local contrast, then two unsharp-mask passes.
 * Fraction 0–1 is reported for progress UI.
 */
export async function enhancePlanes(r, g, b, width, height, onFraction) {
  const report = (start, end) => (fraction) => {
    if (onFraction) onFraction(start + (end - start) * fraction);
  };

  let planes = await denoiseMild(r, g, b, width, height, report(0, 0.22));
  planes = await localContrast(planes[0], planes[1], planes[2], width, height, report(0.22, 0.5));

  const longEdge = Math.max(width, height);
  const coarseRadius = longEdge >= 1400 ? 4 : longEdge >= 640 ? 3 : 2;
  planes = await unsharpMask(
    planes[0],
    planes[1],
    planes[2],
    width,
    height,
    { radius: coarseRadius, amount: 1.85, threshold: 1, cap: 72 },
    report(0.5, 0.8)
  );
  planes = await unsharpMask(
    planes[0],
    planes[1],
    planes[2],
    width,
    height,
    { radius: 1, amount: 1.05, threshold: 0, cap: 48 },
    report(0.8, 0.98)
  );
  contrastCurve(planes[0], planes[1], planes[2]);
  if (onFraction) onFraction(1);
  return planes;
}

/** Mean squared Laplacian — higher means more visible edge detail. */
export function edgeEnergy(plane, width, height) {
  let acc = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap = -4 * plane[i] + plane[i - 1] + plane[i + 1] + plane[i - width] + plane[i + width];
      acc += lap * lap;
      count += 1;
    }
  }
  return count === 0 ? 0 : acc / count;
}

export const MAX_PIXELS = 12_000_000;

/** Photos under this long edge are enlarged 2× before the final sharpen. */
export const UPSCALE_BELOW = 1000;

export function fitPixels(width, height, maxPixels = MAX_PIXELS) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (w * h <= maxPixels) return { width: w, height: h, scaled: false };
  const scale = Math.sqrt(maxPixels / (w * h));
  let nw = Math.max(1, Math.floor(w * scale));
  let nh = Math.max(1, Math.floor(h * scale));
  while (nw * nh > maxPixels && (nw > 1 || nh > 1)) {
    if (nw >= nh && nw > 1) nw -= 1;
    else nh -= 1;
  }
  return { width: nw, height: nh, scaled: true };
}

export function upscaleSize(width, height, maxPixels = MAX_PIXELS) {
  const longEdge = Math.max(width, height);
  if (longEdge >= UPSCALE_BELOW) return { width, height, scaled: false };
  let scale = 2;
  if (width * height * scale * scale > maxPixels) {
    scale = Math.sqrt(maxPixels / (width * height));
  }
  if (scale < 1.15) return { width, height, scaled: false };
  const nw = Math.max(1, Math.round(width * scale));
  const nh = Math.max(1, Math.round(height * scale));
  if (nw === width && nh === height) return { width, height, scaled: false };
  return { width: nw, height: nh, scaled: true };
}
