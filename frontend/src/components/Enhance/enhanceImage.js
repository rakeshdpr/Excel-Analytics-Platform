import {
  MAX_PIXELS,
  enhancePlanes,
  fitPixels,
  restoreFineStrokes,
  upscaleSize,
} from './enhanceKernels';

export const MAX_FILE_BYTES = 40 * 1024 * 1024;
export const MAX_SOURCE_PIXELS = 48_000_000;

const JPEG = 'image/jpeg';
const PNG = 'image/png';
const WEBP = 'image/webp';

function userError(message, code) {
  const error = new Error(message);
  error.expose = true;
  error.code = code;
  return error;
}

function cancelledError() {
  const error = new Error('Cancelled');
  error.code = 'CANCELLED';
  return error;
}

/**
 * @returns {string|null} A message when the file should not be opened.
 */
export function validateFile(file) {
  if (!file) return 'Choose an image to enhance.';
  const size = file.size || 0;
  if (size <= 0) return 'This file is empty.';
  if (size > MAX_FILE_BYTES) {
    return 'This file is too large. Please use an image under 40 MB.';
  }

  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || '');
  const extOk = /\.(jpe?g|png|webp)$/i.test(name);
  const typeOk = type === JPEG || type === PNG || type === WEBP;

  if (type.startsWith('image/') && !typeOk) {
    return 'This file is not supported. Use a JPEG, PNG, or WebP image.';
  }
  if (!typeOk && !extOk) {
    return 'This file is not supported. Use a JPEG, PNG, or WebP image.';
  }
  return null;
}

function outputMime(file) {
  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || '');
  if (type === JPEG || /\.jpe?g$/i.test(name)) return JPEG;
  if (type === WEBP || /\.webp$/i.test(name)) return WEBP;
  return PNG;
}

export function enhancedFilename(name, mime) {
  const raw = String(name || 'photo').split(/[/\\]/).pop();
  const stem = raw.replace(/\.[^.]+$/, '') || 'photo';
  const safe = stem.replace(/[^\w.-]+/g, '_').replace(/^\.+/, '').slice(0, 80) || 'photo';
  const ext = mime === JPEG ? 'jpg' : mime === WEBP ? 'webp' : 'png';
  return `${safe}-enhanced.${ext}`;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(userError('Enhancement failed. Try another photo.', 'EXPORT'));
      else resolve(blob);
    }, type, quality);
  });
}

function drawSource(source, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return { canvas, ctx };
}

function scaleImageData(imageData, width, height) {
  const src = document.createElement('canvas');
  src.width = imageData.width;
  src.height = imageData.height;
  src.getContext('2d').putImageData(imageData, 0, 0);
  const { canvas, ctx } = drawSource(src, width, height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function imageDataToBlob(imageData, type, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, type, quality);
}

function u8(value) {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return (value + 0.5) | 0;
}

function split(imageData) {
  const { width, height, data } = imageData;
  const n = width * height;
  const r = new Float32Array(n);
  const g = new Float32Array(n);
  const b = new Float32Array(n);
  const a = new Uint8ClampedArray(n);
  for (let i = 0, p = 0; i < n; i += 1, p += 4) {
    r[i] = data[p];
    g[i] = data[p + 1];
    b[i] = data[p + 2];
    a[i] = data[p + 3];
  }
  return { r, g, b, a, width, height };
}

function join(r, g, b, a, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, p = 0; i < r.length; i += 1, p += 4) {
    data[p] = u8(r[i]);
    data[p + 1] = u8(g[i]);
    data[p + 2] = u8(b[i]);
    data[p + 3] = a[i];
  }
  return new ImageData(data, width, height);
}

function decodeWithImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(userError('This image could not be opened. Try a different JPEG, PNG, or WebP.', 'DECODE'));
    };
    img.src = url;
  });
}

async function decodeFile(file) {
  if (typeof createImageBitmap !== 'function') {
    return decodeWithImage(file);
  }
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw userError('This image could not be opened. Try a different JPEG, PNG, or WebP.', 'DECODE');
    }
  }
}

/**
 * Enhance a JPEG, PNG, or WebP entirely in the browser.
 * Calls `onPreview` with a JPEG blob of the fitted original once pixels are ready.
 */
export async function enhanceFile(file, { onProgress, onPreview, isCancelled } = {}) {
  const problem = validateFile(file);
  if (problem) throw userError(problem, 'VALIDATE');

  const report = (pct, stage) => {
    if (onProgress) onProgress(Math.max(0, Math.min(100, pct)), stage);
  };
  const check = () => {
    if (isCancelled && isCancelled()) throw cancelledError();
  };

  report(4, 'Opening the photo');
  const source = await decodeFile(file);
  check();

  const sourceWidth = source.width;
  const sourceHeight = source.height;
  if (!sourceWidth || !sourceHeight) {
    if (source.close) source.close();
    throw userError('This image could not be opened. Try a different JPEG, PNG, or WebP.', 'DECODE');
  }
  if (sourceWidth * sourceHeight > MAX_SOURCE_PIXELS) {
    if (source.close) source.close();
    throw userError('This image is too large. Please use a photo under about 48 megapixels.', 'TOO_BIG');
  }

  const fitted = fitPixels(sourceWidth, sourceHeight, MAX_PIXELS);
  report(8, 'Reading pixels');
  const { canvas, ctx } = drawSource(source, fitted.width, fitted.height);
  if (source.close) source.close();
  check();

  const beforeBlob = await canvasToBlob(canvas, JPEG, 0.92);
  if (onPreview) onPreview(beforeBlob);

  let imageData = ctx.getImageData(0, 0, fitted.width, fitted.height);
  let parts = split(imageData);
  const notes = [];
  if (fitted.scaled) {
    notes.push(
      `This photo was over 12 megapixels, so it was reduced to ${fitted.width}×${fitted.height} before enhancing.`
    );
  }

  const beforeWidth = parts.width;
  const beforeHeight = parts.height;

  const planes = await enhancePlanes(parts.r, parts.g, parts.b, parts.width, parts.height, (fraction) => {
    check();
    let stage = 'Sharpening';
    if (fraction < 0.48) stage = 'Clearing soft focus';
    else if (fraction < 0.78) stage = 'Clearing text';
    else if (fraction < 0.86) stage = 'Reducing noise';
    else if (fraction < 0.94) stage = 'Lifting local contrast';
    else if (fraction < 0.99) stage = 'Sharpening';
    else stage = 'Finishing';
    report(10 + fraction * 68, stage);
  });

  imageData = join(planes[0], planes[1], planes[2], parts.a, parts.width, parts.height);

  const next = upscaleSize(parts.width, parts.height, MAX_PIXELS);
  if (next.scaled) {
    report(80, 'Enlarging the photo');
    check();
    imageData = scaleImageData(imageData, next.width, next.height);
    parts = split(imageData);
    const sharpened = await restoreFineStrokes(
      parts.r,
      parts.g,
      parts.b,
      parts.width,
      parts.height,
      (fraction) => {
        check();
        report(82 + fraction * 12, 'Clearing text');
      }
    );
    imageData = join(sharpened[0], sharpened[1], sharpened[2], parts.a, parts.width, parts.height);
    notes.push(
      `The photo was small, so it was enlarged from ${beforeWidth}×${beforeHeight} to ${next.width}×${next.height}.`
    );
  }

  report(96, 'Preparing the preview');
  check();

  let mime = outputMime(file);
  let blob;
  try {
    blob = await imageDataToBlob(imageData, mime, 0.92);
  } catch (error) {
    if (mime === PNG) throw error;
    mime = PNG;
    blob = await imageDataToBlob(imageData, PNG);
  }

  report(100, 'Done');
  return {
    blob,
    filename: enhancedFilename(file.name, mime),
    note: notes.join(' '),
    meta: {
      sourceWidth,
      sourceHeight,
      outputWidth: imageData.width,
      outputHeight: imageData.height,
    },
  };
}
