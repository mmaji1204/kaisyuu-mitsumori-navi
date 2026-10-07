import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getCurrentBusinessPartnerId } from "@/lib/business-auth";
import { getLeadPhotoPath } from "@/lib/lead-photo-path";
import { createSupabaseAdminClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { leadPhotosBucket } from "@/lib/supabase/photos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const isAdmin = await isAdminLoggedIn();
  const partnerId = isAdmin ? null : await getCurrentBusinessPartnerId();
  if (!isAdmin && !partnerId) return new Response(null, { status: 401 });
  if (!hasSupabaseServerEnv()) return new Response(null, { status: 503 });
  const { path: segments } = await params;
  const path = getLeadPhotoPath(`lead-photos:${segments.join("/")}`);
  if (!path) return new Response(null, { status: 404 });

  try {
    const supabase = createSupabaseAdminClient();
    const leadId = segments[0];
    if (!isAdmin) {
      const { data, error } = await supabase.from("lead_deliveries")
        .select("id").eq("lead_id", leadId).eq("partner_id", partnerId!).single();
      if (error || !data) return new Response(null, { status: 404 });
    }
    const { data: lead, error } = await supabase.from("leads")
      .select("photo_urls, after_photo_urls").eq("id", leadId).single();
    if (error || !lead) return new Response(null, { status: 404 });
    const references: string[] = [...(lead.photo_urls ?? []), ...(lead.after_photo_urls ?? [])];
    if (!references.some(reference => getLeadPhotoPath(reference) === path)) {
      return new Response(null, { status: 404 });
    }
    const { data: photo, error: downloadError } = await supabase.storage.from(leadPhotosBucket).download(path);
    if (downloadError || !photo) return new Response(null, { status: 404 });
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(photo.type)) {
      return new Response(null, { status: 415 });
    }
    return new Response(photo, { headers: {
      "Content-Type": photo.type,
      "Cache-Control": "private, no-store",
      "Vary": "Cookie",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
