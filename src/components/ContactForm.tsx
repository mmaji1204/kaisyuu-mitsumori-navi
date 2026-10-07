"use client";

import { FormEvent, useState } from "react";
import type { Lead } from "@/lib/leads";
import { useQuoteArea } from "@/components/QuoteJourney";

type SubmittedData = {
  name: string;
  item: string;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function ContactForm() {
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { area, setArea } = useQuoteArea();

  async function handlePostalCodeBlur(postalCode: string) {
    const normalizedPostalCode = postalCode.replace(/[^0-9]/g, "");

    if (normalizedPostalCode.length !== 7) {
      return;
    }

    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalizedPostalCode}`,
      );
      const result = (await response.json()) as {
        results?: {
          address1: string;
          address2: string;
          address3: string;
        }[];
      };
      const address = result.results?.[0];

      if (address) {
        setArea(`${address.address1}${address.address2}${address.address3}`);
      }
    } catch {
      // 住所補完に失敗しても手入力で進められます。
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setIsSubmitting(true);
    setErrorMessage("");
    setSubmittedData(null);

    const formData = new FormData(form);
    const name = formData.get("name")?.toString() ?? "";
    const tel = formData.get("tel")?.toString() ?? "";
    const areaValue = formData.get("area")?.toString() ?? "";
    const item = formData.get("item")?.toString() ?? "";
    const desiredDate = formData.get("desired_date")?.toString() ?? "";
    const message = formData.get("message")?.toString() ?? "";
    const photos = formData.getAll("photos").filter((value) => value instanceof File);
    const photoNames = photos
      .map((photo) => photo.name)
      .filter(Boolean)
      .slice(0, 5);

    const lead: Lead = {
      id: crypto.randomUUID(),
      status: "課金",
      statusColor: "green",
      date: formatDate(new Date()),
      request: `不用品回収 ${item}`,
      kana: "",
      name,
      address: areaValue,
      phone: tel,
      fee: "900 円",
      progress: "未対応",
      estimate: "例: 50000",
      memo: "",
      message: [
        message,
        desiredDate ? `希望日時: ${desiredDate}` : "",
        photoNames.length > 0 ? `写真: ${photoNames.join("、")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      desiredDate,
      photoNames,
      photoUrls: [],
    };

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("lead", JSON.stringify(lead));
      photos.slice(0, 5).forEach((photo) => {
        uploadFormData.append("photos", photo);
      });

      const response = await fetch("/api/leads", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("送信に失敗しました。");
      }

      const result = (await response.json()) as {
        lead?: Lead;
        mode?: "demo" | "supabase";
      };

      if (result.mode !== "supabase" || !result.lead?.id) {
        throw new Error("受付の保存を確認できませんでした。");
      }

      setErrorMessage("");
      form.reset();
      setArea("");
      setSubmittedData({ name, item });
    } catch {
      setSubmittedData(null);
      setErrorMessage(
        "送信できませんでした。時間をおいてもう一度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-4 text-slate-900 shadow-sm sm:p-6"
    >
      <div className="mb-5 rounded-lg bg-[#f2f6ed] p-4 text-sm leading-7 text-[#263d32]">
        <p className="font-bold">入力は1回。対応業者へまとめて相談できます。</p>
        <p>送信後、対応業者から電話等でご連絡します。料金や日程を比べてから依頼先をお選びください。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <label className="block">
          <span className="text-sm font-bold">お名前 <span className="text-xs text-orange-700">必須</span></span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="山田 太郎"
            required
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">電話番号 <span className="text-xs text-orange-700">必須</span></span>
          <input
            type="tel"
            name="tel"
            autoComplete="tel"
            placeholder="090-0000-0000"
            required
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">郵便番号</span>
          <input
            type="text"
            name="postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="7300011"
            onBlur={(event) => handlePostalCodeBlur(event.currentTarget.value)}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">お住まいの地域 <span className="text-xs text-orange-700">必須</span></span>
          <input
            type="text"
            name="area"
            placeholder="東京都世田谷区"
            required
            value={area}
            onChange={(event) => setArea(event.currentTarget.value)}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">回収したい品目 <span className="text-xs text-orange-700">必須</span></span>
          <input
            type="text"
            name="item"
            placeholder="ソファ、冷蔵庫、洗濯機など"
            required
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">希望日時</span>
          <input
            type="text"
            name="desired_date"
            placeholder="例: 土日午前、平日の14時以降"
            className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">写真 <span className="text-xs font-normal text-slate-500">任意・5枚まで</span></span>
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              const invalid = files.length > 5 || files.some(file => file.size > 8 * 1024 * 1024);
              event.currentTarget.setCustomValidity(invalid ? "写真は1枚8MB以下、5枚まで選択してください。" : "");
              event.currentTarget.reportValidity();
            }}
            className="mt-2 block min-h-12 w-full rounded-md border border-slate-300 px-2 py-2 text-sm font-bold text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-emerald-700 sm:px-3"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">JPEG・PNG・WebP・GIF／1枚8MB以下。住所や顔などは写さず、品物と搬出経路を撮影してください。</span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-bold">相談内容</span>
        <textarea
          name="message"
          placeholder="回収したいものの量や希望日があれば入力してください。"
          rows={5}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-base outline-none transition-colors focus:border-emerald-600 sm:px-4"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "送信中..." : "無料でまとめて見積もりを依頼する →"}
      </button>

      {!submittedData && errorMessage ? (
        <div role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {submittedData ? (
        <div role="status" className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
          <p className="font-bold">
            {submittedData.name} 様、送信しました。
          </p>
          <p>
            「{submittedData.item}」について、担当者からの連絡をお待ちください。
          </p>
          <button
            type="button"
            onClick={() => setSubmittedData(null)}
            className="mt-3 font-bold text-emerald-800 underline underline-offset-4"
          >
            もう一度入力する
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          入力内容は、見積もりのご案内と対応業者への相談内容の共有に利用します。送信だけで回収予約は確定しません。
        </p>
      )}
    </form>
  );
}
