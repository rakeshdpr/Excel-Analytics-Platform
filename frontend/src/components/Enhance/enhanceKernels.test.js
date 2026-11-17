import { boxBlurRGB, edgeEnergy, enhancePlanes, fitPixels, upscaleSize } from './enhanceKernels';
import { enhancedFilename, validateFile } from './enhanceImage';

function flat(width, height, value) {
  return new Float32Array(width * height).fill(value);
}

test('box blur keeps a flat field unchanged', async () => {
  const src = flat(16, 16, 40);
  const [out] = await boxBlurRGB(src, src, src, 16, 16, 2);
  expect(out[0]).toBeCloseTo(40, 4);
  expect(out[out.length - 1]).toBeCloseTo(40, 4);
  expect(out[8 * 16 + 3]).toBeCloseTo(40, 4);
});

test('box blur spreads a single bright pixel', async () => {
  const src = new Float32Array(9);
  src[4] = 9;
  const [out] = await boxBlurRGB(src, src, src, 3, 3, 1);
  expect(out[4]).toBeCloseTo(1, 4);
});

test('enhancePlanes makes a blurred pattern sharper', async () => {
  const width = 80;
  const height = 48;
  const sharp = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const stripe = Math.floor(x / 4) % 2 === 0 ? 24 : 220;
      const inBlock = x > 18 && x < 52 && y > 10 && y < 36;
      sharp[y * width + x] = inBlock ? 200 : stripe;
    }
  }
  const once = (await boxBlurRGB(sharp, sharp, sharp, width, height, 2))[0];
  const blurred = (await boxBlurRGB(once, once, once, width, height, 2))[0];
  const [enhanced] = await enhancePlanes(blurred, blurred, blurred, width, height);
  const blurredEnergy = edgeEnergy(blurred, width, height);
  const enhancedEnergy = edgeEnergy(enhanced, width, height);
  expect(enhancedEnergy).toBeGreaterThan(blurredEnergy * 1.25);
  for (let i = 0; i < enhanced.length; i += 1) {
    expect(enhanced[i]).toBeGreaterThanOrEqual(0);
    expect(enhanced[i]).toBeLessThanOrEqual(255);
  }
});

test('fitPixels caps images above 12 megapixels', () => {
  const fitted = fitPixels(5000, 4000);
  expect(fitted.scaled).toBe(true);
  expect(fitted.width * fitted.height).toBeLessThanOrEqual(12_000_000);
  expect(fitPixels(800, 600).scaled).toBe(false);
});

test('upscaleSize doubles a small photo and leaves a large one', () => {
  expect(upscaleSize(640, 480)).toEqual({ width: 1280, height: 960, scaled: true });
  expect(upscaleSize(1600, 1200).scaled).toBe(false);
});

test('validateFile accepts common photos and rejects the rest', () => {
  expect(validateFile({ name: 'a.jpg', type: 'image/jpeg', size: 1000 })).toBeNull();
  expect(validateFile({ name: 'a.png', type: 'image/png', size: 1000 })).toBeNull();
  expect(validateFile({ name: 'shot.webp', type: '', size: 1000 })).toBeNull();
  expect(validateFile({ name: 'notes.txt', type: 'text/plain', size: 20 })).toMatch(/not supported/i);
  expect(validateFile({ name: 'anim.gif', type: 'image/gif', size: 20 })).toMatch(/not supported/i);
  expect(validateFile({ name: 'big.jpg', type: 'image/jpeg', size: 41 * 1024 * 1024 })).toMatch(/too large/i);
  expect(validateFile({ name: 'empty.jpg', type: 'image/jpeg', size: 0 })).toMatch(/empty/i);
});

test('enhancedFilename keeps a safe stem and extension', () => {
  expect(enhancedFilename('My Photo.JPG', 'image/jpeg')).toBe('My_Photo-enhanced.jpg');
  expect(enhancedFilename('scan.png', 'image/png')).toBe('scan-enhanced.png');
});
