import { Lead } from "@/lib/leads";

export type LeadRow = {
  id: string;
  status: Lead["status"];
  status_color: Lead["statusColor"];
  requested_at: string;
  request: string;
  kana: string | null;
  name: string;
  address: string;
  phone: string;
  fee: string;
  progress: Lead["progress"];
  estimate: string;
  memo: string;
  message: string;
  desired_date?: string | null;
  photo_names?: string[] | null;
  photo_urls?: string[] | null;
  after_photo_names?: string[] | null;
  after_photo_urls?: string[] | null;
  duplicate_warning?: boolean | null;
  created_at: string;
};

export type LeadInsert = Omit<LeadRow, "id" | "created_at"> & {
  id?: string;
};

export type PartnerRow = {
  id: string;
  name: string;
  email: string;
  auto_assign_enabled?: boolean;
  daily_delivery_limit?: number | null;
  monthly_budget_limit?: number | null;
  notification_email?: string | null;
  service_area: string;
  status: "active" | "paused";
  created_at: string;
};

export type LeadDeliveryRow = {
  id: string;
  lead_id: string;
  partner_id: string;
  delivery_status: Lead["status"];
  fee: string;
  created_at: string;
};

export type LeadActivityRow = {
  id: string;
  lead_id: string;
  partner_id: string;
  action_type: string;
  note: string;
  created_at: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function mapLeadRowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    status: row.status,
    statusColor: row.status_color,
    date: formatDateTime(row.requested_at),
    request: row.request,
    kana: row.kana ?? "",
    name: row.name,
    address: row.address,
    phone: row.phone,
    fee: row.fee,
    progress: row.progress,
    estimate: row.estimate,
    memo: row.memo,
    message: row.message,
    desiredDate: row.desired_date ?? "",
    photoNames: row.photo_names ?? [],
    photoUrls: row.photo_urls ?? [],
    afterPhotoNames: row.after_photo_names ?? [],
    afterPhotoUrls: row.after_photo_urls ?? [],
    duplicateWarning: Boolean(row.duplicate_warning),
  };
}

export function mapLeadToInsert(lead: Lead): LeadInsert {
  return {
    id: lead.id,
    status: lead.status,
    status_color: lead.statusColor,
    requested_at: new Date().toISOString(),
    request: lead.request,
    kana: lead.kana || null,
    name: lead.name,
    address: lead.address,
    phone: lead.phone,
    fee: lead.fee,
    progress: lead.progress,
    estimate: lead.estimate,
    memo: lead.memo,
    message: lead.message,
    desired_date: lead.desiredDate || null,
    photo_names: lead.photoNames ?? [],
    photo_urls: lead.photoUrls ?? [],
    after_photo_names: lead.afterPhotoNames ?? [],
    after_photo_urls: lead.afterPhotoUrls ?? [],
    duplicate_warning: Boolean(lead.duplicateWarning),
  };
}
