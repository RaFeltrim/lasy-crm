/**
 * Performance monitoring utilities for tracking key user interactions
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  start(name: string): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    performance.mark(`${name}-start`);
  }

  /**
   * End measuring a performance metric and log the result
   */
  end(name: string, metadata?: Record<string, any>): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`[Performance] No start mark found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metadata);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Measure an async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name);
    try {
      const result = await operation();
      this.end(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.end(name, { ...metadata, success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // In a real application, you would send this to your analytics service
    // Example: analytics.track('performance', metric)
    
    // For now, we'll just store it in sessionStorage for debugging
    try {
      const stored = sessionStorage.getItem('performance-metrics');
      const metrics = stored ? JSON.parse(stored) : [];
      metrics.push(metric);
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.shift();
      }
      
      sessionStorage.setItem('performance-metrics', JSON.stringify(metrics));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; total: number; min: number; max: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.total += metric.duration;
      stat.min = Math.min(stat.min, metric.duration);
      stat.max = Math.max(stat.max, metric.duration);
    });

    return Object.entries(summary).reduce((acc, [name, stat]) => {
      acc[name] = {
        count: stat.count,
        avg: stat.total / stat.count,
        min: stat.min,
        max: stat.max,
      };
      return acc;
    }, {} as Record<string, { count: number; avg: number; min: number; max: number }>);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startPerformanceMeasure = (name: string) => performanceMonitor.start(name);
export const endPerformanceMeasure = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.end(name, metadata);
export const measurePerformance = <T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measure(name, operation, metadata);
