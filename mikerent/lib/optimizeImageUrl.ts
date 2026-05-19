/** Пресети ширини для Next/Image sizes */
export const IMAGE_WIDTH = {
  card: 480,
  cardLg: 640,
  gallery: 1200,
  galleryThumb: 160,
  hero: 1920,
} as const;

/**
 * Cloudinary: f_auto,q_auto + ширина — менший вага, швидше LCP.
 * data: та інші URL — без змін.
 */
export function optimizeImageUrl(
  src: string,
  width: number = IMAGE_WIDTH.card,
): string {
  if (!src?.trim()) return src;

  if (src.startsWith("data:")) {
    return src;
  }

  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }

  const transform = `f_auto,q_auto,w_${width}`;
  const uploadIdx = src.indexOf("/upload/");

  if (uploadIdx === -1) return src;

  const afterUpload = src.slice(uploadIdx + "/upload/".length);
  if (
    afterUpload.startsWith(`${transform}/`) ||
    afterUpload.includes("f_auto") ||
    /(^|,)w_\d+/.test(afterUpload)
  ) {
    return src;
  }

  return `${src.slice(0, uploadIdx)}/upload/${transform}/${afterUpload}`;
}

export function isDataImageUrl(src: string): boolean {
  return src.startsWith("data:");
}
