"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Home, Link as LinkIcon, Loader2, Upload, X } from "lucide-react";
import { uploadApartmentImagesFromFiles } from "@/lib/uploadApartmentImages";
import { isPersistableImageUrl } from "@/lib/validateApartmentImages";

type Props = {
  images: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  coverImageUrl: string | null;
  onCoverChange: (url: string | null) => void;
};

export function ApartmentImagesField({
  images,
  onChange,
  coverImageUrl,
  onCoverChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (url && !images.includes(url)) {
      onChange([...images, url]);
      if (!coverImageUrl && isPersistableImageUrl(url)) {
        onCoverChange(url);
      }
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    const removed = images[index];
    const next = images.filter((_, idx) => idx !== index);
    onChange(next);
    if (removed && coverImageUrl === removed) {
      const fallback = next.find((u) => isPersistableImageUrl(u)) ?? null;
      onCoverChange(fallback);
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(`0 / ${files.length}`);

    try {
      const { urls, skipped, failed } = await uploadApartmentImagesFromFiles(
        files,
        (done, total) => setUploadProgress(`${done} / ${total}`),
      );

      if (urls.length > 0) {
        onChange((prev) => {
          const merged = [...prev, ...urls];
          if (!coverImageUrl && urls[0]) {
            onCoverChange(urls[0]);
          }
          return merged;
        });
      }

      const parts: string[] = [];
      if (urls.length > 0) parts.push(`додано ${urls.length}`);
      if (skipped.length > 0) {
        parts.push(`пропущено (не зображення): ${skipped.length}`);
      }
      if (failed.length > 0) {
        parts.push(
          `помилки: ${failed.map((f) => `${f.name} — ${f.reason}`).join("; ")}`,
        );
      }

      if (parts.length > 0 && (skipped.length > 0 || failed.length > 0)) {
        alert(parts.join("\n"));
      }
    } catch {
      alert("Помилка завантаження фото");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Натисніть <Home className="inline h-4 w-4 text-blue-600" /> на фото,
        яке має бути на картці <strong>головної сторінки</strong>. На сторінці
        квартири — усі фото як раніше.
      </p>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Завантажити з комп&apos;ютера
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif"
          multiple
          disabled={uploading}
          onChange={(e) => void handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Завантаження… {uploadProgress}
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Обрати файли (будь-яка кількість)
            </>
          )}
        </button>
        <p className="mt-1 text-xs text-gray-500">
          Кожне фото завантажується окремо в Cloudinary. Без Cloudinary на Railway
          квартира не збережеться — додайте змінні CLOUDINARY_CLOUD_NAME і
          CLOUDINARY_UPLOAD_PRESET.
        </p>
        {images.some((u) => u.startsWith("data:")) && (
          <p className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
            Є фото, які не завантажились на сервер. Видаліть їх і завантажте знову
            через кнопку вище або вставте посилання https://
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          placeholder="Або вставте посилання (https://...)"
          className="flex-1 rounded border p-2 focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addImageUrl}
          disabled={!imageUrlInput.trim()}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <LinkIcon size={20} />
          Додати
        </button>
      </div>

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((img, i) => {
            const isCover = coverImageUrl === img;
            const canBeCover = isPersistableImageUrl(img);
            return (
              <div
                key={`img-${i}-${img.slice(0, 32)}`}
                className={`group relative rounded ring-2 ${
                  isCover ? "ring-blue-500" : "ring-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={`Фото ${i + 1}`}
                  className="h-24 w-full rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
                {isCover && (
                  <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Головна
                  </span>
                )}
                {canBeCover && (
                  <button
                    type="button"
                    title="Показати на головній сторінці"
                    onClick={() => onCoverChange(img)}
                    className={`absolute bottom-1 left-1 flex h-7 w-7 items-center justify-center rounded-full shadow ${
                      isCover
                        ? "bg-blue-600 text-white"
                        : "bg-white/90 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Home size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
          Поки немає фото
        </p>
      )}
    </div>
  );
}
