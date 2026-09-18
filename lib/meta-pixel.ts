'use client';

type MetaPixelQueue = (...args: unknown[]) => void;

/**
 * Safely queue a Meta Pixel event via the global `fbq` function.
 *
 * The base pixel code in app/layout.tsx defines `window.fbq` as a queueable
 * stub and runs `fbq('init', …)`, so tracking calls here don't need to re-pass
 * the Pixel ID. Guarded so it's a no-op during SSR and before the stub exists.
 */
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: MetaPixelQueue }).fbq;
  if (typeof fbq === 'function') {
    fbq('track', event, params);
  }
}
