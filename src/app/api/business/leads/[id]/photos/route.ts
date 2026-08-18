import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentBusinessPartnerId,
  isBusinessLoggedIn,
} from "@/lib/business-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";
import { deleteLeadPhotoByUrl, uploadLeadPhotos } from "@/lib/supabase/photos";

type LeadAfterPhotoRow = {
  after_photo_names: string[] | null;
  after_photo_urls: string[] | null;
};

function redirectToDetail(request: NextRequest, id: string, key: string) {
  return NextResponse.redirect(
    new URL(`/business/users/${id}?${key}=1`, request.url),
    { status: 303 },
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await isBusinessLoggedIn())) {
    return NextResponse.redirect(new URL("/business/login", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return redirectToDetail(request, id, "error");
  }

  const partnerId = await getCurrentBusinessPartnerId();

  if (!partnerId) {
    return redirectToDetail(request, id, "error");
  }

  const supabase = createSupabaseAdminClient();
  const { data: delivery } = await supabase
    .from("lead_deliveries")
    .select("id")
    .eq("lead_id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!delivery) {
    return redirectToDetail(request, id, "error");
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("after_photo_names, after_photo_urls")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return redirectToDetail(request, id, "error");
  }

  const formData = await request.formData();
  const intent = formData.get("intent")?.toString() || "upload";
  const photoLead = lead as LeadAfterPhotoRow;
  const currentNames = photoLead.after_photo_names ?? [];
  const currentUrls = photoLead.after_photo_urls ?? [];

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
        after_photo_names: nextNames,
        after_photo_urls: nextUrls,
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
      after_photo_names: [...currentNames, ...uploaded.photoNames],
      after_photo_urls: [...currentUrls, ...uploaded.photoUrls],
    })
    .eq("id", id);

  return error
    ? redirectToDetail(request, id, "error")
    : redirectToDetail(request, id, "photosUpdated");
}
