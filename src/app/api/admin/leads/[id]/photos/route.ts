import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";
import { deleteLeadPhotoByUrl, uploadLeadPhotos } from "@/lib/supabase/photos";

type LeadPhotoRow = {
  after_photo_names: string[] | null;
  after_photo_urls: string[] | null;
  photo_names: string[] | null;
  photo_urls: string[] | null;
};

function redirectToDetail(request: NextRequest, id: string, key: string) {
  return NextResponse.redirect(new URL(`/admin/leads/${id}?${key}=1`, request.url), {
    status: 303,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return redirectToDetail(request, id, "error");
  }

  const formData = await request.formData();
  const intent = formData.get("intent")?.toString() || "upload";
  const photoKind = formData.get("photo_kind")?.toString() === "after" ? "after" : "before";
  const supabase = createSupabaseAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("photo_names, photo_urls, after_photo_names, after_photo_urls")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return redirectToDetail(request, id, "error");
  }

  const photoLead = lead as LeadPhotoRow;
  const nameColumn = photoKind === "after" ? "after_photo_names" : "photo_names";
  const urlColumn = photoKind === "after" ? "after_photo_urls" : "photo_urls";
  const currentNames = photoLead[nameColumn] ?? [];
  const currentUrls = photoLead[urlColumn] ?? [];

  if (intent === "delete") {
    const photoUrl = formData.get("photo_url")?.toString() ?? "";
    const nextUrls = currentUrls.filter((url) => url !== photoUrl);
    const removedIndex = currentUrls.findIndex((url) => url === photoUrl);
    const nextNames =
      removedIndex >= 0
        ? currentNames.filter((_, index) => index !== removedIndex)
        : currentNames;

    await deleteLeadPhotoByUrl(photoUrl);

    const { error } = await supabase
      .from("leads")
      .update({
        [nameColumn]: nextNames,
        [urlColumn]: nextUrls,
      })
      .eq("id", id);

    return error
      ? redirectToDetail(request, id, "error")
      : redirectToDetail(request, id, "photosUpdated");
  }

  const photos = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const uploaded = await uploadLeadPhotos(id, photos);

  const { error } = await supabase
    .from("leads")
    .update({
      [nameColumn]: [...currentNames, ...uploaded.photoNames],
      [urlColumn]: [...currentUrls, ...uploaded.photoUrls],
    })
    .eq("id", id);

  return error
    ? redirectToDetail(request, id, "error")
    : redirectToDetail(request, id, "photosUpdated");
}
