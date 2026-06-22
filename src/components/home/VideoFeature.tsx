"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * VideoFeature
 *
 * - Default state shows a poster thumbnail with a click-to-play button (fallback).
 * - When the video scrolls into view, an IntersectionObserver auto-loads the
 *   YouTube iframe with autoplay=1&mute=1&loop=1 (muted autoplay is required by
 *   browser policy).
 * - Clicking the play button loads the iframe with sound (unmuted autoplay),
 *   which is allowed because it happens inside a user gesture.
 * - Once activated (by either trigger), the poster is replaced by the iframe.
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);
  const [muted, setMuted] = useState(true);
  const [thumbSrc, setThumbSrc] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  );

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Auto-play (muted) once the video area enters the viewport
  useEffect(() => {
    if (activated) return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setMuted(true);
            setActivated(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  // Click-to-play fallback: load with sound (user gesture allows unmuted autoplay)
  const handlePlay = () => {
    setMuted(false);
    setActivated(true);
  };

  // loop=1 requires playlist=<videoId> for a single video on YouTube embeds
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playsinline=1&rel=0&playlist=${videoId}`;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${title}`}
            className="absolute top-0 left-0 h-full w-full cursor-pointer"
          >
            {/* Poster thumbnail (fall back to hqdefault if maxres is missing) */}
            <img
              src={thumbSrc}
              alt={title}
              loading="lazy"
              onError={() =>
                setThumbSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
              }
              className="absolute top-0 left-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] transition-transform group-hover:scale-110 md:h-20 md:w-20">
                <Play
                  className="ml-1 h-7 w-7 text-white md:h-9 md:w-9"
                  fill="currentColor"
                />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
