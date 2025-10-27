'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log Web Vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can send to your analytics service here
      // Example: sendToAnalytics(metric)
      
      // For now, we'll use the Performance API
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Store metrics in performance marks for later retrieval
        performance.mark(`web-vitals-${metric.name}`, {
          detail: {
            value: metric.value,
            rating: metric.rating,
          },
        });
      }
    }

    // Check if metrics meet performance targets
    const targets = {
      FCP: 1000, // First Contentful Paint < 1s
      LCP: 2000, // Largest Contentful Paint < 2s
      FID: 100,  // First Input Delay < 100ms
      CLS: 0.1,  // Cumulative Layout Shift < 0.1
      TTFB: 600, // Time to First Byte < 600ms
      INP: 200,  // Interaction to Next Paint < 200ms
    };

    const target = targets[metric.name as keyof typeof targets];
    if (target && metric.value > target) {
      console.warn(
        `[Performance Warning] ${metric.name} (${metric.value.toFixed(2)}) exceeds target (${target})`
      );
    }
  });

  return null;
}
