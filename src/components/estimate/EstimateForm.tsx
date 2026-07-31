"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Home,
  Building2,
  Siren,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  MessageCircle,
  Phone,
  CheckCircle2,
  Pencil,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { site, type Locale } from "@/lib/site";
import {
  estimateSchema,
  stepSchemas,
  defaultEstimate,
  PROPERTY_TYPES,
  type EstimateInput,
} from "@/lib/estimate-schema";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPhone, formatPostal, toTelHref, cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PhotoUpload, type UploadedPhoto } from "./PhotoUpload";

// Photos come first — the customer's own image of the driveway sets the context
// for everything the owner reads afterward.
const STEPS = ["photos", "service", "property", "details", "contact", "review"] as const;
type Step = (typeof STEPS)[number];

const SERVICE_ICONS = {
  residential: Home,
  commercial: Building2,
  emergency: Siren,
  seasonal: CalendarCheck,
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function EstimateForm() {
  const t = useTranslations("estimate");
  const ts = useTranslations("services");
  const tc = useTranslations("cta");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [data, setData] = useState<Partial<EstimateInput>>({
    ...defaultEstimate,
    locale,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; waUrl: string } | null>(
    null,
  );

  const current: Step = STEPS[step];
  const set = <K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  /** Validates only the fields belonging to the current step. */
  const validateStep = (): boolean => {
    const schema = stepSchemas[current as keyof typeof stepSchemas];
    if (!schema) return true;

    const parsed = schema.safeParse(data);
    if (parsed.success) {
      setErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      next[key] = issue.message;
    }
    setErrors(next);
    return false;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDir(-1);
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const jumpTo = (target: Step) => {
    setDir(-1);
    setErrors({});
    setStep(STEPS.indexOf(target));
  };

  const submit = async () => {
    const parsed = estimateSchema.safeParse({ ...data, locale });
    if (!parsed.success) {
      // Send the user back to the first step that still has a problem.
      const bad = String(parsed.error.issues[0]?.path[0] ?? "");
      const owner = STEPS.find((s) => {
        const sch = stepSchemas[s as keyof typeof stepSchemas];
        return sch && bad in sch.shape;
      });
      if (owner) jumpTo(owner);
      setSubmitError(t("errors.submitFailed"));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { reference: string };

      // The request is saved at this point. WhatsApp is composed only after,
      // so closing it can never lose the lead.
      const message = buildWhatsAppMessage(parsed.data, json.reference);
      setResult({ reference: json.reference, waUrl: buildWhatsAppUrl(message) });
    } catch {
      setSubmitError(t("errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------- SUCCESS ---------------------------- */
  if (result) {
    return (
      <GlassCard className="p-10 text-center md:p-16" tilt={false}>
        <motion.div
          initial={reduced ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <CheckCircle2 className="mx-auto size-14 text-gold-500" strokeWidth={1.25} />
          <h2 className="mt-8 text-display-md text-snow">{t("success.title")}</h2>
          <p className="mx-auto mt-5 max-w-lg text-lead text-ice-300/68">
            {t("success.body", { ref: result.reference })}
          </p>

          <div className="mt-11 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <ButtonLink
              href={result.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="lg"
            >
              <MessageCircle className="size-4" />
              {t("success.openWhatsapp")}
            </ButtonLink>
            <ButtonLink
              href={toTelHref(site.phoneRaw)}
              variant="glass"
              size="lg"
            >
              <Phone className="size-4" />
              {site.phone}
            </ButtonLink>
          </div>

          <p className="mt-7 text-sm text-ice-300/45">{t("success.whatsappHint")}</p>

          <Link
            href="/"
            className="mt-9 inline-block text-sm text-ice-300/55 underline underline-offset-4 transition-colors duration-300 hover:text-gold-400"
          >
            {t("success.backHome")}
          </Link>
        </motion.div>
      </GlassCard>
    );
  }

  /* ---------------------------- FORM ---------------------------- */
  return (
    <div>
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow text-gold-500">
            {t("stepOf", { current: step + 1, total: STEPS.length })}
          </p>
          <p className="text-sm text-ice-300/55">{t(`steps.${current}`)}</p>
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-gold-600 to-gold-400"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </div>

        {/* Step dots — clickable for steps already completed */}
        {/* `py-2.5` keeps these above the 44px touch target on a phone — they
            are tappable shortcuts back to a completed step, not just labels. */}
        <ol className="mt-3 flex flex-wrap gap-x-5">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i < step && jumpTo(s)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-2 py-2.5 text-xs transition-colors duration-300",
                  i < step && "text-ice-300/70 hover:text-gold-400",
                  i === step && "text-gold-400",
                  i > step && "cursor-default text-ice-300/28",
                )}
              >
                <span
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full border text-[0.625rem]",
                    i < step && "border-gold-500/50 bg-gold-500/15 text-gold-400",
                    i === step && "border-gold-500 bg-gold-500 text-navy-950",
                    i > step && "border-ice-300/18",
                  )}
                >
                  {i < step ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}
                </span>
                {t(`steps.${s}`)}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Panels */}
      <GlassCard className="p-8 md:p-12" tilt={false} spotlight={false}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current}
            custom={dir}
            initial={reduced ? false : { opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <h2 className="text-display-sm text-snow">{t(`${current}.title`)}</h2>
            <p className="mt-3 text-[1.0625rem] text-ice-300/58">
              {t(`${current}.subtitle`)}
            </p>

            <div className="mt-10">
              {/* ---------------- SERVICE ---------------- */}
              {current === "service" && (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {(["residential", "commercial", "emergency", "seasonal"] as const).map(
                    (key) => {
                      const Icon = SERVICE_ICONS[key];
                      const active = data.serviceType === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => set("serviceType", key)}
                          aria-pressed={active}
                          className={cn(
                            "group rounded-2xl border p-6 text-left transition-all duration-400 ease-(--ease-out-expo)",
                            active
                              ? "border-gold-500/55 bg-gold-500/10"
                              : "border-ice-300/12 bg-white/4 hover:border-ice-300/28 hover:bg-white/7",
                          )}
                        >
                          <span className="flex items-start justify-between gap-4">
                            <Icon
                              className={cn(
                                "size-6 transition-colors duration-400",
                                active ? "text-gold-500" : "text-ice-400/70",
                              )}
                              strokeWidth={1.5}
                              aria-hidden
                            />
                            {active && (
                              <Check className="size-4 text-gold-500" strokeWidth={3} />
                            )}
                          </span>
                          <span className="mt-5 block font-display text-lg font-bold tracking-[-0.02em] text-snow">
                            {ts(`${key}.name`)}
                          </span>
                          <span className="mt-1.5 block text-sm text-ice-300/55">
                            {ts(`${key}.tagline`)}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {/* ---------------- PROPERTY ---------------- */}
              {current === "property" && (
                <div className="space-y-9">
                  <Field label={t("property.type")} error={errors.propertyType && t("errors.selectType")}>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {PROPERTY_TYPES.map((key) => {
                        const active = data.propertyType === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => set("propertyType", key)}
                            aria-pressed={active}
                            className={cn(
                              "rounded-xl border px-4 py-3.5 text-left text-[0.9375rem] transition-all duration-300",
                              active
                                ? "border-gold-500/55 bg-gold-500/10 text-snow"
                                : "border-ice-300/12 bg-white/4 text-ice-300/70 hover:border-ice-300/26 hover:text-snow",
                            )}
                          >
                            {t(`property.types.${key}`)}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <div>
                    <span className="block text-sm font-medium text-ice-300/78">
                      {t("property.tempo")}
                    </span>
                    <p className="mb-3 mt-1 text-sm text-ice-300/45">
                      {t("property.tempoHint")}
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        { val: true, label: t("property.tempoYes") },
                        { val: false, label: t("property.tempoNo") },
                      ].map((opt) => {
                        const active = data.tempo === opt.val;
                        return (
                          <button
                            key={String(opt.val)}
                            type="button"
                            onClick={() => set("tempo", opt.val)}
                            aria-pressed={active}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-[0.9375rem] transition-all duration-300",
                              active
                                ? "border-gold-500/55 bg-gold-500/10 text-snow"
                                : "border-ice-300/12 bg-white/4 text-ice-300/70 hover:border-ice-300/26 hover:text-snow",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                                active
                                  ? "border-gold-500 bg-gold-500"
                                  : "border-ice-300/28",
                              )}
                            >
                              {active && (
                                <Check
                                  className="size-3 text-navy-950"
                                  strokeWidth={3.5}
                                  aria-hidden
                                />
                              )}
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field label={t("property.vehicles")}>
                    <Stepper
                      value={data.vehicles ?? 0}
                      onChange={(v) => set("vehicles", v)}
                      max={50}
                    />
                  </Field>
                </div>
              )}

              {/* ---------------- DETAILS ---------------- */}
              {current === "details" && (
                <div className="space-y-9">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {(["walkways", "garage", "stairs", "sidewalk", "deicing"] as const).map(
                      (key) => {
                        const active = Boolean(data[key]);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => set(key, !active)}
                            aria-pressed={active}
                            className={cn(
                              "flex items-center gap-3.5 rounded-xl border px-5 py-4 text-left transition-all duration-300",
                              active
                                ? "border-gold-500/55 bg-gold-500/10"
                                : "border-ice-300/12 bg-white/4 hover:border-ice-300/26",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-300",
                                active
                                  ? "border-gold-500 bg-gold-500"
                                  : "border-ice-300/28",
                              )}
                            >
                              {active && (
                                <Check
                                  className="size-3 text-navy-950"
                                  strokeWidth={3.5}
                                  aria-hidden
                                />
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-[0.9375rem]",
                                active ? "text-snow" : "text-ice-300/70",
                              )}
                            >
                              {t(`details.${key}`)}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  <Field label={t("details.obstacles")}>
                    <textarea
                      rows={3}
                      value={data.obstacles ?? ""}
                      onChange={(e) => set("obstacles", e.target.value)}
                      placeholder={t("details.obstaclesPlaceholder")}
                      className={cn(inputCls, "min-h-24 resize-y")}
                    />
                  </Field>

                  <Field label={t("details.notes")}>
                    <textarea
                      rows={4}
                      value={data.notes ?? ""}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder={t("details.notesPlaceholder")}
                      className={cn(inputCls, "min-h-28 resize-y")}
                    />
                  </Field>
                </div>
              )}

              {/* ---------------- PHOTOS ---------------- */}
              {current === "photos" && (
                <PhotoUpload
                  value={data.photos ?? []}
                  onChange={(photos: UploadedPhoto[]) => set("photos", photos)}
                />
              )}

              {/* ---------------- CONTACT ---------------- */}
              {current === "contact" && (
                <div className="space-y-6">
                  {/* Honeypot */}
                  <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
                    <label htmlFor="est-website">Website</label>
                    <input
                      id="est-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={data.website ?? ""}
                      onChange={(e) => set("website", e.target.value)}
                    />
                  </div>

                  <Field label={t("contact.name")} error={errors.name && t("errors.nameShort")}>
                    <input
                      type="text"
                      autoComplete="name"
                      value={data.name ?? ""}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder={t("contact.namePlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label={t("contact.phone")} error={errors.phone && t("errors.phoneInvalid")}>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={data.phone ?? ""}
                        onChange={(e) => set("phone", formatPhone(e.target.value))}
                        placeholder={t("contact.phonePlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                    <Field label={t("contact.email")} error={errors.email && t("errors.emailInvalid")}>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={data.email ?? ""}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder={t("contact.emailPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label={t("contact.address")} error={errors.address && t("errors.required")}>
                    <input
                      type="text"
                      autoComplete="street-address"
                      value={data.address ?? ""}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder={t("contact.addressPlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label={t("contact.city")} error={errors.city && t("errors.required")}>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        value={data.city ?? ""}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder={t("contact.cityPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                    <Field
                      label={t("contact.postalCode")}
                      error={errors.postalCode && t("errors.postalInvalid")}
                    >
                      <input
                        type="text"
                        autoComplete="postal-code"
                        value={data.postalCode ?? ""}
                        onChange={(e) => set("postalCode", formatPostal(e.target.value))}
                        placeholder={t("contact.postalPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3.5 pt-2">
                    <input
                      type="checkbox"
                      checked={Boolean(data.consent)}
                      onChange={(e) =>
                        set("consent", e.target.checked as unknown as true)
                      }
                      className="mt-1 size-4.5 shrink-0 cursor-pointer appearance-none rounded border border-ice-300/30 bg-white/5 checked:border-gold-500 checked:bg-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                    />
                    <span className="text-sm leading-relaxed text-ice-300/62">
                      {t("contact.consent")}
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="flex items-center gap-2 text-sm text-gold-400">
                      <AlertCircle className="size-4" aria-hidden />
                      {t("contact.consentRequired")}
                    </p>
                  )}
                </div>
              )}

              {/* ---------------- REVIEW ---------------- */}
              {current === "review" && (
                <div className="space-y-3">
                  <Summary
                    title={t("steps.service")}
                    onEdit={() => jumpTo("service")}
                    editLabel={t("review.edit")}
                    rows={[[t("steps.service"), data.serviceType ? ts(`${data.serviceType}.name`) : "—"]]}
                  />
                  <Summary
                    title={t("steps.property")}
                    onEdit={() => jumpTo("property")}
                    editLabel={t("review.edit")}
                    rows={[
                      [
                        t("property.type"),
                        data.propertyType ? t(`property.types.${data.propertyType}`) : "—",
                      ],
                      [t("property.vehicles"), String(data.vehicles ?? 0)],
                      [
                        t("property.tempo"),
                        data.tempo ? t("property.tempoYes") : t("property.tempoNo"),
                      ],
                    ]}
                  />
                  <Summary
                    title={t("steps.details")}
                    onEdit={() => jumpTo("details")}
                    editLabel={t("review.edit")}
                    rows={[
                      [
                        t("details.title"),
                        ([
                          data.walkways && t("details.walkways"),
                          data.garage && t("details.garage"),
                          data.stairs && t("details.stairs"),
                          data.sidewalk && t("details.sidewalk"),
                          data.deicing && t("details.deicing"),
                        ].filter(Boolean) as string[]).join(", ") || "—",
                      ],
                      ...(data.obstacles ? [[t("details.obstacles"), data.obstacles] as [string, string]] : []),
                      ...(data.notes ? [[t("details.notes"), data.notes] as [string, string]] : []),
                    ]}
                  />
                  <Summary
                    title={t("steps.photos")}
                    onEdit={() => jumpTo("photos")}
                    editLabel={t("review.edit")}
                    rows={[[t("steps.photos"), t("photos.count", { count: data.photos?.length ?? 0 })]]}
                  />
                  <Summary
                    title={t("steps.contact")}
                    onEdit={() => jumpTo("contact")}
                    editLabel={t("review.edit")}
                    rows={[
                      [t("contact.name"), data.name ?? "—"],
                      [t("contact.phone"), data.phone ?? "—"],
                      [t("contact.email"), data.email ?? "—"],
                      [
                        t("contact.address"),
                        [data.address, data.city, data.postalCode].filter(Boolean).join(", ") || "—",
                      ],
                    ]}
                  />

                  <p className="!mt-8 rounded-xl border border-ice-300/10 bg-white/4 p-5 text-sm leading-relaxed text-ice-300/60">
                    {t("review.whatsappNote")}
                  </p>

                  {submitError && (
                    <p
                      role="alert"
                      className="!mt-4 flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/8 p-4 text-sm text-gold-300"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden />
                      {submitError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-ice-300/8 pt-8">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={goBack}
            disabled={step === 0}
            className={step === 0 ? "invisible" : undefined}
          >
            <ArrowLeft className="size-4" />
            {tc("back")}
          </Button>

          {current === "photos" && (data.photos?.length ?? 0) === 0 && (
            <button
              type="button"
              onClick={goNext}
              className="text-sm text-ice-300/50 underline underline-offset-4 transition-colors duration-300 hover:text-gold-400"
            >
              {t("photos.skip")}
            </button>
          )}

          {current === "review" ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? t("review.submitting") : t("review.submit")}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          ) : (
            <Button type="button" variant="primary" size="lg" onClick={goNext}>
              {tc("next")}
              <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */

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

function Stepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-ice-300/14 bg-white/4 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="−"
        className="flex size-10 items-center justify-center rounded-lg text-lg text-ice-300/70 transition-colors duration-300 hover:bg-white/8 hover:text-snow"
      >
        −
      </button>
      <span className="w-12 text-center font-display text-lg font-bold text-snow">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="+"
        className="flex size-10 items-center justify-center rounded-lg text-lg text-ice-300/70 transition-colors duration-300 hover:bg-white/8 hover:text-snow"
      >
        +
      </button>
    </div>
  );
}

function Summary({
  title,
  rows,
  onEdit,
  editLabel,
}: {
  title: string;
  rows: [string, string][];
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-ice-300/10 bg-white/4 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="eyebrow text-gold-500/85">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs text-ice-300/55 transition-colors duration-300 hover:text-gold-400"
        >
          <Pencil className="size-3" aria-hidden />
          {editLabel}
        </button>
      </div>
      <dl className="mt-5 space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-wrap gap-x-4 gap-y-1">
            <dt className="w-40 shrink-0 text-sm text-ice-300/45">{k}</dt>
            <dd className="min-w-0 flex-1 text-[0.9375rem] text-snow/88">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
