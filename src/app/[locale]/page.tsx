import { setRequestLocale } from "next-intl/server";
import { HeroVideo } from "@/components/hero/HeroVideo";
import { TrustBar } from "@/components/sections/TrustBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Process } from "@/components/sections/Process";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { ServiceAreas } from "@/components/sections/ServiceAreas";
import { TestimonialsMarquee } from "@/components/sections/TestimonialsMarquee";
import { FaqPreview } from "@/components/sections/FaqPreview";
import { FinalCta } from "@/components/sections/FinalCta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroVideo />
      <TrustBar />
      <ServicesGrid />
      <Process />
      <BeforeAfter />
      <TestimonialsMarquee />
      <ServiceAreas />
      <FaqPreview />
      <FinalCta />
    </>
  );
}
