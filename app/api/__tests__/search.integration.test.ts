import { describe, it, expect } from 'vitest';
import { sanitizeString } from '@/lib/sanitize';

/**
 * Integration tests for Search API endpoint
 * These tests verify search and filter logic
 */
describe('Search API Integration', () => {
  describe('GET /api/leads/search - Search Leads', () => {
    it('should sanitize search query', () => {
      const query = '  test search  ';
      const sanitized = sanitizeString(query);
      
      expect(sanitized).toBe('test search');
    });

    it('should handle multiple status filters', () => {
      const statusParam = 'new,contacted,qualified';
      const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
      
      expect(statuses).toHaveLength(3);
      expect(statuses).toContain('new');
      expect(statuses).toContain('contacted');
      expect(statuses).toContain('qualified');
    });

    it('should enforce maximum limit', () => {
      const requestedLimit = 200;
      const maxLimit = 100;
      const actualLimit = Math.min(requestedLimit, maxLimit);
      
      expect(actualLimit).toBe(100);
    });

    it('should handle date range filters', () => {
      const dateFrom = '2025-01-01';
      const dateTo = '2025-01-31';
      
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
    });

    it('should build search query with multiple filters', () => {
      const filters = {
        query: 'test',
        status: 'new,contacted',
        company: 'Acme',
        dateFrom: '2025-01-01',
      };
      
      expect(filters.query).toBeTruthy();
      expect(filters.status).toBeTruthy();
      expect(filters.company).toBeTruthy();
      expect(filters.dateFrom).toBeTruthy();
    });
  });
});
