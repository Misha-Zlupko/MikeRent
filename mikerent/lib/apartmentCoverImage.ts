import {
  filterPersistableImages,
  isPersistableImageUrl,
} from "@/lib/validateApartmentImages";

/** Обкладинка для головної: обране фото або перше з галереї. */
export function resolveCoverImageUrl(
  coverImageUrl: string | null | undefined,
  images: string[],
): string | null {
  const list = filterPersistableImages(images);
  if (list.length === 0) return null;

  const cover = coverImageUrl?.trim();
  if (cover && isPersistableImageUrl(cover) && list.includes(cover)) {
    return cover;
  }
  return list[0];
}

/** Одне фото для картки на головній. */
export function homeCardImages(
  coverImageUrl: string | null | undefined,
  images: string[],
): string[] {
  const cover = resolveCoverImageUrl(coverImageUrl, images);
  return cover ? [cover] : [];
}

export function normalizeCoverImageUrlForSave(
  coverImageUrl: unknown,
  images: string[],
): string | null {
  if (typeof coverImageUrl !== "string" || !coverImageUrl.trim()) {
    return resolveCoverImageUrl(null, images);
  }
  return resolveCoverImageUrl(coverImageUrl, images);
}
