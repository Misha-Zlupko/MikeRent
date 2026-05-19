import { compressImageFile, isImageFile } from "@/lib/compressImageFile";

export type UploadImagesResult = {
  urls: string[];
  skipped: string[];
  failed: { name: string; reason: string }[];
};

/** Завантажує кожне фото окремим запитом — без ліміту кількості в одному JSON. */
export async function uploadApartmentImagesFromFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadImagesResult> {
  const urls: string[] = [];
  const skipped: string[] = [];
  const failed: { name: string; reason: string }[] = [];

  const imageFiles = files.filter((f) => {
    if (isImageFile(f)) return true;
    skipped.push(f.name);
    return false;
  });

  let done = 0;
  const total = imageFiles.length;

  for (const file of imageFiles) {
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed, compressed.name);

      const res = await fetch("/api/admin/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        failed.push({
          name: file.name,
          reason: data.error || `HTTP ${res.status}`,
        });
      } else {
        const data = (await res.json()) as { url: string };
        if (data.url) urls.push(data.url);
      }
    } catch (err) {
      failed.push({
        name: file.name,
        reason: err instanceof Error ? err.message : "Невідома помилка",
      });
    }

    done += 1;
    onProgress?.(done, total);
  }

  return { urls, skipped, failed };
}
