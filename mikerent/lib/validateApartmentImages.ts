/** Base64 у JSON дає 413 на хостингу — лише URL (https або Cloudinary). */
export function isPersistableImageUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("data:")) return false;
  return u.startsWith("http://") || u.startsWith("https://");
}

export function filterPersistableImages(images: string[]): string[] {
  return images.filter(isPersistableImageUrl);
}

export function getInvalidImageMessage(images: string[]): string | null {
  const bad = images.filter((u) => u.trim().startsWith("data:"));
  if (bad.length === 0) return null;
  return (
    `Фото не збережені на сервер (${bad.length} у вигляді base64). ` +
    "Налаштуйте Cloudinary (CLOUDINARY_CLOUD_NAME і CLOUDINARY_UPLOAD_PRESET у змінних середовища на Railway) " +
    "і завантажте фото знову, або додайте посилання https:// на кожне фото."
  );
}
