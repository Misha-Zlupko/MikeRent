import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const MAX_FILE_MB = 12;

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) return null;

  const body = new FormData();
  body.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: "image/jpeg" }),
    filename,
  );
  body.append("upload_preset", uploadPreset);
  body.append("folder", "mikerent/apartments");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Cloudinary upload failed:", err);
    return null;
  }

  const data = (await res.json()) as { secure_url?: string };
  return data.secure_url ?? null;
}

export async function POST(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const raw = formData.get("file");

    if (!raw || !(raw instanceof Blob)) {
      return NextResponse.json({ error: "Файл не передано" }, { status: 400 });
    }

    if (raw.size > MAX_FILE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Файл більший за ${MAX_FILE_MB} MB` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await raw.arrayBuffer());
    const filename =
      raw instanceof File && raw.name ? raw.name : `photo-${Date.now()}.jpg`;

    const cloudinaryUrl = await uploadToCloudinary(buffer, filename);
    if (cloudinaryUrl) {
      return NextResponse.json({ url: cloudinaryUrl });
    }

    return NextResponse.json(
      {
        error:
          "Завантаження фото на сервер не налаштовано. Додайте на Railway змінні CLOUDINARY_CLOUD_NAME і CLOUDINARY_UPLOAD_PRESET (unsigned preset), або вставляйте посилання https:// на фото.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("upload-images:", error);
    return NextResponse.json(
      { error: "Помилка завантаження фото" },
      { status: 500 },
    );
  }
}
