import React, { useEffect, useRef, useState } from 'react';
import { MediaAssetConfig } from '../data/salonData';

interface MediaSlotProps {
  media: MediaAssetConfig;
  priority?: boolean;
  subtleMotion?: boolean;
  monochromeUntilHover?: boolean;
  className?: string;
  imgClassName?: string;
  overlayClassName?: string;
}

/**
 * Resilient editorial media renderer.
 * Supports inline muted looping video playback for /videos/hero.mp4 and
 * /videos/approach-1.mp4 .. approach-4.mp4 with near-viewport lazy loading
 * and automatic fallback to high-resolution beauty photography.
 */
export const MediaSlot: React.FC<MediaSlotProps> = ({
  media,
  priority = false,
  subtleMotion = true,
  monochromeUntilHover = false,
  className = '',
  imgClassName = '',
  overlayClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [inView, setInView] = useState(priority);

  useEffect(() => {
    if (priority) {
      setInView(true);
      return;
    }
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  const shouldRenderVideo = Boolean(media.enableVideo && media.videoPath && !videoError && inView);

  useEffect(() => {
    const vid = videoRef.current;
    if (shouldRenderVideo && vid) {
      vid.muted = true;
      const playPromise = vid.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Ignore autoplay restrictions if any
        });
      }
    }
  }, [shouldRenderVideo, media.videoPath]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-[#DDD6CE] ${className}`}>
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          src={media.videoPath}
          poster={media.posterPath}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          aria-label={media.alt}
          onError={() => setVideoError(true)}
          className={`h-full w-full object-cover transition-transform duration-1000 ease-out ${
            monochromeUntilHover
              ? 'grayscale contrast-95 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100'
              : ''
          } ${imgClassName}`}
          style={{ objectPosition: media.focalPoint || 'center center' }}
        />
      ) : !imageError ? (
        <img
          src={media.posterPath}
          alt={media.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            subtleMotion ? 'animate-editorial-film' : ''
          } ${
            monochromeUntilHover
              ? 'grayscale contrast-95 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-focus-visible:grayscale-0'
              : ''
          } ${imgClassName}`}
          style={{ objectPosition: media.focalPoint || 'center center' }}
        />
      ) : (
        /* Resilient Zero-Broken-Image CSS/SVG Fallback */
        <div
          role="img"
          aria-label={media.alt}
          className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#E5DEC9] via-[#D8CFC8] to-[#8B8086] p-8 text-center text-[#121620]"
        >
          <svg
            className="mb-3 h-8 w-8 opacity-45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3C14.5 7.5 14.5 16.5 12 21C9.5 16.5 9.5 7.5 12 3Z" />
          </svg>
          <span className="font-serif-editorial text-lg italic tracking-wide opacity-75">
            {media.alt}
          </span>
        </div>
      )}

      {overlayClassName && (
        <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} aria-hidden="true" />
      )}
    </div>
  );
};
