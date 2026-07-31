"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { UploadCloud, X, Camera, ImageIcon, FileVideo, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

import { getBrowserSupabase, PHOTOS_BUCKET } from "@/lib/supabase";
import { bytesToSize, cn } from "@/lib/utils";

export type UploadedPhoto = {
  url: string;
  name: string;
  size: number;
  type: string;
};

type Item = {
  id: string;
  file: File;
  preview: string;
  status: "compressing" | "uploading" | "done" | "error";
  url: string;
  size: number;
};

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 20;
const ACCEPTED = "image/jpeg,image/png,image/heic,image/heif,image/webp,video/mp4,video/quicktime";

/**
 * Drag-drop / camera upload with client-side compression.
 *
 * Images are compressed in the browser before upload — a phone photo is
 * routinely 6 MB and carries no useful extra detail for measuring a driveway,
 * so this keeps uploads fast on a mobile connection. Videos pass through.
 *
 * If Supabase storage isn't configured the files stay local: previews still
 * work and the filenames are still submitted, so the request is never blocked
 * by missing infrastructure.
 */
export function PhotoUpload({
  onChange,
}: {
  /** Present for API symmetry; the component owns its own file list. */
  value: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
}) {
  const t = useTranslations("estimate.photos");
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Keep the parent's value in sync with whatever has finished processing.
  useEffect(() => {
    const done = items
      .filter((i) => i.status === "done" || i.status === "error")
      .map((i) => ({
        url: i.url,
        name: i.file.name,
        size: i.size,
        type: i.file.type,
      }));
    onChange(done);
    // `onChange` is recreated each render by the parent; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Revoke object URLs on unmount so previews don't leak.
  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFile = useCallback(async (file: File, id: string) => {
    const supabase = getBrowserSupabase();
    const isVideo = file.type.startsWith("video/");

    let uploadable = file;

    if (!isVideo) {
      try {
        uploadable = await imageCompression(file, {
          maxSizeMB: 1.6,
          maxWidthOrHeight: 2200,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch {
        // Compression is an optimisation — fall back to the original.
        uploadable = file;
      }
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "uploading", size: uploadable.size } : i,
      ),
    );

    if (!supabase) {
      // No storage configured — record the file without a URL.
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "done", url: "" } : i)),
      );
      return;
    }

    const ext = uploadable.name.split(".").pop() ?? "jpg";
    const key = `${new Date().getFullYear()}/${id}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(key, uploadable, { cacheControl: "3600", upsert: false });

    if (upErr) {
      console.error("[upload] failed", upErr);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "error", url: "" } : i)),
      );
      return;
    }

    const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(key);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "done", url: data.publicUrl } : i,
      ),
    );
  }, []);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);

      const incoming = Array.from(files);
      const room = MAX_FILES - items.length;
      const accepted: File[] = [];

      for (const file of incoming.slice(0, room)) {
        if (file.size > MAX_BYTES) {
          setError(`${file.name} — ${t("tooLarge")}`);
          continue;
        }
        if (!ACCEPTED.split(",").includes(file.type)) {
          setError(`${file.name} — ${t("wrongType")}`);
          continue;
        }
        accepted.push(file);
      }

      const next: Item[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "compressing",
        url: "",
        size: file.size,
      }));

      setItems((prev) => [...prev, ...next]);
      next.forEach((i) => void processFile(i.file, i.id));
    },
    [items.length, processFile, t],
  );

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-400 ease-(--ease-out-expo) md:p-14",
          dragging
            ? "border-gold-500/70 bg-gold-500/8"
            : "border-ice-300/16 bg-white/3 hover:border-ice-300/28",
        )}
      >
        <motion.div animate={{ y: dragging ? -4 : 0 }} transition={{ duration: 0.3 }}>
          <UploadCloud
            className={cn(
              "mx-auto size-10 transition-colors duration-400",
              dragging ? "text-gold-500" : "text-ice-400/50",
            )}
            strokeWidth={1.25}
            aria-hidden
          />
        </motion.div>

        <p className="mt-6 font-display text-lg font-bold tracking-[-0.02em] text-snow">
          {t("dropzone")}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-ice-300/18 bg-white/6 px-5 py-2.5 text-sm text-snow backdrop-blur-xl transition-colors duration-300 hover:bg-white/12"
          >
            {t("browse")}
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-ice-300/18 bg-white/6 px-5 py-2.5 text-sm text-snow backdrop-blur-xl transition-colors duration-300 hover:bg-white/12 sm:hidden"
          >
            <Camera className="size-4" aria-hidden />
            {t("camera")}
          </button>
        </div>

        <p className="mt-5 text-xs text-ice-300/42">{t("accepted")}</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          aria-label={t("browse")}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          aria-label={t("camera")}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-gold-400">
          {error}
        </p>
      )}

      {/* Previews */}
      {items.length > 0 && (
        <>
          <p className="mt-8 text-sm text-ice-300/55">
            {t("count", { count: items.length })}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isVideo = item.file.type.startsWith("video/");
                const busy =
                  item.status === "compressing" || item.status === "uploading";
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-ice-300/12 bg-navy-900"
                  >
                    {isVideo ? (
                      <span className="flex size-full items-center justify-center">
                        <FileVideo
                          className="size-8 text-ice-400/50"
                          strokeWidth={1.25}
                          aria-hidden
                        />
                      </span>
                    ) : (
                      // Blob preview of a user-selected file — next/image can't
                      // optimise an object URL, so a plain img is correct here.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.preview}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}

                    {busy && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-950/72 backdrop-blur-sm">
                        <Loader2
                          className="size-5 animate-spin text-gold-500"
                          aria-hidden
                        />
                        <span className="text-[0.6875rem] text-ice-300/70">
                          {item.status === "compressing"
                            ? t("compressing")
                            : t("uploading")}
                        </span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`${t("remove")} ${item.file.name}`}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-navy-950/80 text-snow opacity-0 backdrop-blur-md transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>

                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-linear-to-t from-navy-950/90 to-transparent px-2.5 py-2 text-[0.6875rem] text-ice-300/75">
                      <ImageIcon className="size-3 shrink-0" aria-hidden />
                      {bytesToSize(item.size)}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}
