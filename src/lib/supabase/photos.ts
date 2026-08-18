import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const leadPhotosBucket = "lead-photos";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFKC")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function ensureLeadPhotosBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: bucket } = await supabase.storage.getBucket(leadPhotosBucket);

  if (bucket) {
    return;
  }

  const { error } = await supabase.storage.createBucket(leadPhotosBucket, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message);
  }
}

export async function uploadLeadPhotos(leadId: string, photos: File[]) {
  if (photos.length === 0) {
    return {
      photoNames: [] as string[],
      photoUrls: [] as string[],
    };
  }

  await ensureLeadPhotosBucket();

  const supabase = createSupabaseAdminClient();
  const uploaded = await Promise.all(
    photos.slice(0, 8).map(async (photo) => {
      if (!photo.type.startsWith("image/") || photo.size > 8 * 1024 * 1024) {
        return null;
      }

      const safeName = sanitizeFileName(photo.name || "photo");
      const path = `${leadId}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage
        .from(leadPhotosBucket)
        .upload(path, photo, {
          contentType: photo.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = supabase.storage.from(leadPhotosBucket).getPublicUrl(path);

      return {
        name: photo.name,
        path,
        url: data.publicUrl,
      };
    }),
  );
  const validUploaded = uploaded.filter(Boolean) as {
    name: string;
    path: string;
    url: string;
  }[];

  return {
    photoNames: validUploaded.map((photo) => photo.name),
    photoUrls: validUploaded.map((photo) => photo.url),
  };
}

export async function deleteLeadPhotoByUrl(url: string) {
  const marker = `/${leadPhotosBucket}/`;
  const [, path] = url.split(marker);

  if (!path) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(leadPhotosBucket).remove([decodeURIComponent(path)]);
}
