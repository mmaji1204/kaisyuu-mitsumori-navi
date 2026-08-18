"use client";

import { useState } from "react";

type PhotoGalleryProps = {
  canDelete?: boolean;
  canUpload?: boolean;
  deleteAction?: string;
  emptyText?: string;
  photoKind: "before" | "after";
  title: string;
  uploadAction?: string;
  urls: string[];
};

export function PhotoGallery({
  canDelete = false,
  canUpload = false,
  deleteAction,
  emptyText = "写真はまだありません。",
  photoKind,
  title,
  uploadAction,
  urls,
}: PhotoGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 space-y-3">
        <h3 className="text-xl font-black text-slate-800">
          {title}
        </h3>
        {canUpload && uploadAction ? (
          <form
            action={uploadAction}
            method="post"
            encType="multipart/form-data"
            className="grid min-w-0 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_84px]"
          >
            <input type="hidden" name="photo_kind" value={photoKind} />
            <label className="min-w-0 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:border-orange-300 hover:bg-orange-50/60">
              <span className="block truncate">写真ファイルを選択</span>
              <input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                className="sr-only"
              />
            </label>
            <button className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">
              追加
            </button>
          </form>
        ) : null}
      </div>

      {urls.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {urls.map((url, index) => (
            <div
              key={url}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setPreviewUrl(url)}
                className="block w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${title} ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-600 shadow-sm hover:text-orange-500"
                >
                  大きく見る
                </button>
                {canDelete && deleteAction ? (
                  <form action={deleteAction} method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="photo_kind" value={photoKind} />
                    <input type="hidden" name="photo_url" value={url} />
                    <button className="rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-500 hover:text-red-600">
                      削除
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
          {emptyText}
        </p>
      )}

      {previewUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-black text-slate-800">{title}</p>
              <button
                type="button"
                onClick={() => setPreviewUrl("")}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-black text-white"
              >
                閉じる
              </button>
            </div>
            <div className="bg-slate-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${title} プレビュー`}
                className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
