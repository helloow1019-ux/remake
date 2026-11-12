import multer from 'multer';
import { resolve, extname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { env } from '../env.js';

const uploadDirectory = resolve(process.cwd(), env.UPLOAD_DIR);
if (!existsSync(uploadDirectory)) {
  mkdirSync(uploadDirectory, { recursive: true });
}

// Memory storage so we can validate magic bytes and re-encode before saving to disk
const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err: any = new Error('Only JPEG, PNG, and WebP images are allowed');
      err.status = 415;
      err.code = 'UNSUPPORTED_MEDIA_TYPE';
      cb(err);
    }
  },
});

/**
 * Sniffs magic bytes to verify genuine image content.
 */
export function sniffImageMagicBytes(buffer: Buffer): 'jpeg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

/**
 * Validates, re-encodes, strips EXIF, and persists an uploaded file safely to disk.
 * Returns public URL path e.g. "/uploads/<uuid>.webp"
 */
export async function saveUploadedImage(buffer: Buffer): Promise<{ url: string; buffer: Buffer }> {
  const detectedFormat = sniffImageMagicBytes(buffer);
  if (!detectedFormat) {
    const err: any = new Error('Invalid image file content');
    err.status = 415;
    err.code = 'INVALID_IMAGE_BYTES';
    throw err;
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const filePath = resolve(uploadDirectory, filename);

  // Resize and strip EXIF
  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  writeFileSync(filePath, processedBuffer);

  return {
    url: `/uploads/${filename}`,
    buffer: processedBuffer,
  };
}
