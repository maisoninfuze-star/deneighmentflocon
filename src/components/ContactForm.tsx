"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatPhone, cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().refine((v) => v.replace(/\D/g, "").length === 10),
  message: z.string().trim().min(10),
  consent: z.literal(true),
  // Honeypot — bots fill hidden fields, humans never see this one.
  // Left unconstrained so the server, not the client, decides what to do.
  website: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const te = useTranslations("estimate.contact");
  const terr = useTranslations("estimate.errors");
  const tSending = useTranslations("estimate.review")("submitting");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <GlassCard className="p-10 text-center md:p-14" tilt={false}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <CheckCircle2
            className="mx-auto size-12 text-gold-500"
            strokeWidth={1.5}
          />
          <h3 className="mt-7 font-display text-display-sm text-snow">
            {t("sent")}
          </h3>
          <p className="mt-4 text-[1.0625rem] text-ice-300/65">
            {t("sentBody")}
          </p>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 md:p-11" tilt={false}>
      <h2 className="font-display text-display-sm text-snow">
        {t("formTitle")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-6" noValidate>
        {/* Honeypot: visually and programmatically hidden from real users */}
        <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <Field label={te("name")} error={errors.name && terr("nameShort")}>
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder={te("namePlaceholder")}
            className={inputCls}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={te("email")} error={errors.email && terr("emailInvalid")}>
            <input
              {...register("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={te("emailPlaceholder")}
              className={inputCls}
            />
          </Field>

          <Field label={te("phone")} error={errors.phone && terr("phoneInvalid")}>
            <input
              {...register("phone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={te("phonePlaceholder")}
              onChange={(e) =>
                setValue("phone", formatPhone(e.target.value), {
                  shouldValidate: false,
                })
              }
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={t("message")} error={errors.message && terr("required")}>
          <textarea
            {...register("message")}
            rows={5}
            placeholder={t("messagePlaceholder")}
            className={cn(inputCls, "resize-y min-h-32")}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3.5">
          <input
            {...register("consent")}
            type="checkbox"
            className="mt-1 size-4.5 shrink-0 cursor-pointer appearance-none rounded border border-ice-300/30 bg-white/5 checked:border-gold-500 checked:bg-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          />
          <span className="text-sm leading-relaxed text-ice-300/62">
            {te("consent")}
          </span>
        </label>
        {errors.consent && (
          <p className="flex items-center gap-2 text-sm text-gold-400">
            <AlertCircle className="size-4" aria-hidden />
            {te("consentRequired")}
          </p>
        )}

        {status === "error" && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/8 p-4 text-sm text-gold-300"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {terr("submitFailed")}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "sending"}
          className="w-full sm:w-auto"
        >
          <Send className="size-4" />
          {status === "sending" ? tSending : t("send")}
        </Button>
      </form>
    </GlassCard>
  );
}

const inputCls = cn(
  "w-full rounded-xl border border-ice-300/14 bg-white/4 px-5 py-3.5",
  "text-[1rem] text-snow placeholder:text-ice-300/32",
  "backdrop-blur-xl transition-colors duration-300",
  "hover:border-ice-300/25 focus:border-gold-500/60 focus:bg-white/6 focus:outline-none",
);

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-medium text-ice-300/78">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 flex items-center gap-1.5 text-sm text-gold-400">
          <AlertCircle className="size-3.5" aria-hidden />
          {error}
        </span>
      )}
    </label>
  );
}
