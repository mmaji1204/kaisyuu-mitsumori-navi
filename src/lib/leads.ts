export const LEADS_STORAGE_KEY = "kaisyuu-mitsumori-navi-leads";

export type Lead = {
  id: string;
  status: "課金" | "除外";
  statusColor: "green" | "red";
  date: string;
  request: string;
  kana: string;
  name: string;
  address: string;
  phone: string;
  fee: string;
  progress: "未対応" | "現地見積" | "商談中" | "成約" | "失注";
  estimate: string;
  memo: string;
  message: string;
  desiredDate?: string;
  photoNames?: string[];
  photoUrls?: string[];
  afterPhotoNames?: string[];
  afterPhotoUrls?: string[];
  duplicateWarning?: boolean;
};
