"use client";

import { Suspense, lazy } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  Clock,
  Compass,
  Ghost,
  Map as MapIcon,
  Newspaper,
  Package,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span (renders plain text when no article is linked yet)
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

// Eyebrow badge shown above each module title
function SectionEyebrow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
    >
      <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
      <span className="text-xs md:text-sm font-medium tracking-wide">{label}</span>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.panicdelivery.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Panic Delivery Wiki",
        description:
          "Complete Panic Delivery Wiki covering maps, missions, enemies, items, packages, cosmetics, and co-op survival tips for the horror comedy courier game on Steam.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Panic Delivery - Co-op Horror Comedy Courier Survival",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Panic Delivery Wiki",
        alternateName: "Panic Delivery",
        url: siteUrl,
        description:
          "Complete Panic Delivery Wiki resource hub for maps, missions, enemies, items, packages, cosmetics, and co-op survival guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Panic Delivery Wiki - Co-op Horror Comedy Courier Survival",
        },
        sameAs: [
          "https://store.steampowered.com/app/2887450/Panic_Delivery/",
          "https://discord.com/invite/invaderstudios",
          "https://steamcommunity.com/app/2887450",
          "https://www.youtube.com/watch?v=5V07APMIh98",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Panic Delivery",
        gamePlatform: ["PC", "Steam"],
        applicationCategory: "Game",
        genre: ["Co-op", "Horror", "Comedy", "Survival", "Roguelite"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 4,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/2887450/Panic_Delivery/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Panic Delivery - Official Early Access Launch Trailer",
        description:
          "Official Panic Delivery Early Access Launch Trailer - a 4-player co-op horror comedy courier survival game on Steam.",
        uploadDate: "2026-05-13",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/5V07APMIh98",
        url: "https://www.youtube.com/watch?v=5V07APMIh98",
      },
    ],
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid cards map to these section anchors, in order
  const sectionIds = [
    "release-date-early-access",
    "beginner-guide",
    "co-op-multiplayer-guide",
    "missions-package-types",
    "maps-and-zones-guide",
    "monsters-and-enemies-guide",
    "items-tier-list",
    "updates-and-patch-notes",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/2887450/Panic_Delivery/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域之后 */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="5V07APMIh98"
              title="Panic Delivery - Official Early Access Launch Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards (位于视频区之后、Latest Updates 之前) */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = sectionIds[index];
              return (
                <a
                  key={index}
                  href={`#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(sectionId);
                  }}
                  className="scroll-reveal group block rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date and Early Access (info-cards) */}
      <section id="release-date-early-access" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={CalendarCheck} label={t.modules.releaseDateEarlyAccess.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["releaseDateEarlyAccess"]} locale={locale}>
                {t.modules.releaseDateEarlyAccess.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.releaseDateEarlyAccess.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.releaseDateEarlyAccess.items.map((item: any, index: number) => (
              <div
                key={index}
                className={`p-5 md:p-6 rounded-xl border transition-colors ${
                  index === 0
                    ? "bg-[hsl(var(--nav-theme)/0.08)] border-[hsl(var(--nav-theme)/0.4)]"
                    : "bg-white/5 border-border hover:border-[hsl(var(--nav-theme)/0.5)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))] mb-2">
                  {item.label}
                </p>
                <p className="text-lg md:text-xl font-bold mb-2">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 2: Beginner Guide (step-by-step) */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Compass} label={t.modules.beginnerGuide.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["beginnerGuide"]} locale={locale}>
                {t.modules.beginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.beginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.beginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 4: 模块阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 3: Co-op Multiplayer Guide (card-list) */}
      <section id="co-op-multiplayer-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Users} label={t.modules.coopMultiplayerGuide.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["coopMultiplayerGuide"]} locale={locale}>
                {t.modules.coopMultiplayerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.coopMultiplayerGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.coopMultiplayerGuide.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <h3 className="font-bold text-lg mb-1 text-[hsl(var(--nav-theme-light))]">
                  {item.title}
                </h3>
                <p className="font-semibold mb-2">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 4: Missions and Package Types (table) */}
      <section id="missions-package-types" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Package} label={t.modules.missionsPackageTypes.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["missionsPackageTypes"]} locale={locale}>
                {t.modules.missionsPackageTypes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.missionsPackageTypes.intro}
            </p>
          </div>

          {/* Desktop table */}
          <div className="scroll-reveal hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] text-sm">
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Entry</th>
                  <th className="p-4 font-semibold">Game Data</th>
                  <th className="p-4 font-semibold">Player Checklist</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.missionsPackageTypes.rows.map((row: any, index: number) => (
                  <tr key={index} className="border-t border-border align-top">
                    <td className="p-4">
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                        {row.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{row.entry}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.gameData}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.checklist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="scroll-reveal md:hidden space-y-3">
            {t.modules.missionsPackageTypes.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-white/5 border border-border rounded-xl"
              >
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-2">
                  {row.category}
                </span>
                <h3 className="font-bold mb-2">{row.entry}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">Game Data:</span> {row.gameData}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Checklist:</span> {row.checklist}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Maps and Zones Guide (map-cards) */}
      <section id="maps-and-zones-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={MapIcon} label={t.modules.mapsAndZonesGuide.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["mapsAndZonesGuide"]} locale={locale}>
                {t.modules.mapsAndZonesGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.mapsAndZonesGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.mapsAndZonesGuide.cards.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                    {card.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {card.zoneType}
                  </span>
                </div>
                <p className="text-sm font-medium mb-3 text-[hsl(var(--nav-theme-light))]">
                  {card.routeFocus}
                </p>

                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Gameplay
                  </p>
                  <ul className="space-y-1">
                    {card.gameplayData.map((g: string, gi: number) => (
                      <li key={gi} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Risks
                  </p>
                  <ul className="space-y-1">
                    {card.risks.map((r: string, ri: number) => (
                      <li key={ri} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)] rounded-lg">
                  <p className="text-xs uppercase tracking-wider text-[hsl(var(--nav-theme-light))] mb-1">
                    Route Tip
                  </p>
                  <p className="text-sm text-muted-foreground">{card.routeTip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 中段阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 6: Monsters and Enemies Guide (card-list) */}
      <section id="monsters-and-enemies-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Ghost} label={t.modules.monstersAndEnemiesGuide.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["monstersAndEnemiesGuide"]} locale={locale}>
                {t.modules.monstersAndEnemiesGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.monstersAndEnemiesGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.monstersAndEnemiesGuide.cards.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Ghost className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                    {card.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {card.enemyType}
                  </span>
                </div>

                <ul className="space-y-1 mb-3">
                  {card.gameplayData.map((g: string, gi: number) => (
                    <li key={gi} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>

                <p className="text-sm mb-2">
                  <span className="font-semibold text-[hsl(var(--nav-theme-light))]">Behavior: </span>
                  <span className="text-muted-foreground">{card.behavior}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-[hsl(var(--nav-theme-light))]">Counterplay: </span>
                  <span className="text-muted-foreground">{card.counterplay}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Items Tier List (tier-grid) */}
      <section id="items-tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Trophy} label={t.modules.itemsTierList.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["itemsTierList"]} locale={locale}>
                {t.modules.itemsTierList.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.itemsTierList.intro}
            </p>
          </div>

          {(["S", "A", "B", "C"] as const).map((tier) => {
            const tierItems = t.modules.itemsTierList.items.filter(
              (item: any) => item.tier === tier,
            );
            const tierAccent: Record<string, string> = {
              S: "border-l-[hsl(var(--nav-theme))] bg-[hsl(var(--nav-theme)/0.12)]",
              A: "border-l-[hsl(var(--nav-theme)/0.7)] bg-[hsl(var(--nav-theme)/0.08)]",
              B: "border-l-[hsl(var(--nav-theme)/0.45)] bg-[hsl(var(--nav-theme)/0.05)]",
              C: "border-l-[hsl(var(--nav-theme)/0.25)] bg-[hsl(var(--nav-theme)/0.03)]",
            };
            return (
              <div key={tier} className="scroll-reveal mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-extrabold text-lg
                               bg-[hsl(var(--nav-theme))] text-white"
                  >
                    {tier}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold">
                    {t.modules.itemsTierList.tierLabels[tier.toLowerCase()]}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tierItems.map((item: any, index: number) => (
                    <div
                      key={index}
                      className={`p-5 border border-border border-l-4 rounded-xl ${tierAccent[tier]}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                          {item.name}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                          {item.itemType}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        <span className="font-semibold">Best for: </span>
                        <span className="text-muted-foreground">{item.bestFor}</span>
                      </p>
                      <p className="text-sm mb-2 text-muted-foreground">{item.why}</p>
                      <p className="text-sm">
                        <span className="font-semibold text-[hsl(var(--nav-theme-light))]">Team use: </span>
                        <span className="text-muted-foreground">{item.teamUse}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Module 8: Updates and Patch Notes (timeline) */}
      <section id="updates-and-patch-notes" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <SectionEyebrow icon={Newspaper} label={t.modules.updatesAndPatchNotes.eyebrow} />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle linkData={moduleLinkMap["updatesAndPatchNotes"]} locale={locale}>
                {t.modules.updatesAndPatchNotes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.updatesAndPatchNotes.intro}
            </p>
          </div>

          <div className="scroll-reveal relative pl-6 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6">
            {t.modules.updatesAndPatchNotes.entries.map((entry: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-[1.4rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {entry.type}
                    </span>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                  <h3 className="font-bold mb-2">{entry.title}</h3>
                  <ul className="space-y-1 mb-2">
                    {entry.highlights.map((h: string, hi: number) => (
                      <li key={hi} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-[hsl(var(--nav-theme-light))]">Impact: </span>
                    {entry.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/invaderstudios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/InvaderDevs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/2887450"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/2887450/Panic_Delivery/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
