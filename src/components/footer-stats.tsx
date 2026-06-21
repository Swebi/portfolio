'use client';

import { useEffect, useState } from 'react';

export function FooterStats({ buildTime }: { buildTime: number }) {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const [fcp] = performance.getEntriesByName('first-contentful-paint') as PerformancePaintTiming[];
      if (fcp) {
        setLoadTime(Math.round(fcp.startTime));
        return;
      }
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (nav) {
        setLoadTime(Math.round(nav.domContentLoadedEventEnd - nav.startTime));
      }
    };

    if (document.readyState === 'complete') {
      measure();
    } else {
      window.addEventListener('load', measure, { once: true });
    }
  }, []);

  useEffect(() => {
    fetch('/api/views', { method: 'POST' })
      .then((r) => r.json())
      .then(({ views }) => { if (views !== null) setViews(views); })
      .catch(() => {});
  }, []);

  const daysAgo = Math.floor((Date.now() - buildTime) / (1000 * 60 * 60 * 24));
  const lastUpdated =
    daysAgo === 0 ? 'today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

  return (
    <footer className="text-xs text-muted-foreground text-center pt-8 pb-6 sm:pb-0 space-y-1">
      <div>
        Built with Next.js · Deployed on Vercel
        {loadTime !== null && (
          <>
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            Page loaded in {loadTime}ms
          </>
        )}
      </div>
      <div>
        Last updated {lastUpdated}
        {views !== null && ` · ${views.toLocaleString()} views`}
      </div>
    </footer>
  );
}
