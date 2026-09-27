import sharp from 'sharp';

export interface CompressOptions {
  /** Longest edge in pixels; smaller images are never enlarged. */
  maxDimension?: number;
  /** WebP quality, 1–100. */
  quality?: number;
}

export interface CompressedImage {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: 'image/webp';
}

export const DEFAULT_MAX_DIMENSION = 2000;
export const DEFAULT_QUALITY = 80;

/**
 * Re-encodes an uploaded photo for the web: applies the camera's EXIF
 * rotation, strips metadata (GPS and all), caps the longest edge and encodes
 * as WebP. A 20 MB camera JPEG typically lands around 250–500 KB.
 */
export async function compressImage(input: Buffer, options: CompressOptions = {}): Promise<CompressedImage> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const { data, info } = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return { buffer: data, width: info.width, height: info.height, contentType: 'image/webp' };
}
