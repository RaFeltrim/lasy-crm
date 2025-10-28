import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  sanitizeLeadInput,
  sanitizeInteractionInput,
} from '../sanitize';

describe('Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    it('should return null for null or undefined input', () => {
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(null);
    });

    it('should remove null bytes', () => {
      const input = 'test\0string';
      const result = sanitizeString(input);
      expect(result).toBe('teststring');
    });

    it('should remove control characters', () => {
      const input = 'test\x01\x02string';
      const result = sanitizeString(input);
      expect(result).toBe('teststring');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeString(input);
      expect(result).toBe('test string');
    });

    it('should return null for empty string after sanitization', () => {
      const input = '   ';
      const result = sanitizeString(input);
      expect(result).toBe(null);
    });
  });

  describe('sanitizeEmail', () => {
    it('should convert email to lowercase', () => {
      const input = 'Test@Example.COM';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should trim whitespace from email', () => {
      const input = '  test@example.com  ';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should return null for invalid input', () => {
      expect(sanitizeEmail(null)).toBe(null);
      expect(sanitizeEmail(undefined)).toBe(null);
      expect(sanitizeEmail('')).toBe(null);
    });
  });

  describe('sanitizePhone', () => {
    it('should keep valid phone characters', () => {
      const input = '+1 (234) 567-8900';
      const result = sanitizePhone(input);
      expect(result).toBe('+1 (234) 567-8900');
    });

    it('should remove invalid characters', () => {
      const input = '+1-234-567-8900 ext. 123';
      const result = sanitizePhone(input);
      expect(result).toBe('+1-234-567-8900  123');
    });

    it('should return null for empty input', () => {
      expect(sanitizePhone(null)).toBe(null);
      expect(sanitizePhone(undefined)).toBe(null);
    });
  });

  describe('sanitizeText', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello  World');
    });

    it('should remove event handlers', () => {
      const input = 'Click <div onclick="alert()">here</div>';
      const result = sanitizeText(input);
      expect(result).toBe('Click <div >here</div>');
    });

    it('should remove javascript: protocol', () => {
      const input = 'Link: javascript:alert("xss")';
      const result = sanitizeText(input);
      expect(result).toBe('Link: alert("xss")');
    });

    it('should preserve normal text', () => {
      const input = 'This is a normal text with some notes.';
      const result = sanitizeText(input);
      expect(result).toBe('This is a normal text with some notes.');
    });
  });

  describe('sanitizeLeadInput', () => {
    it('should sanitize all lead fields', () => {
      const input = {
        name: '  John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1-234-567-8900',
        company: 'Acme Corp',
        status: 'new',
        notes: 'Some notes here',
      };

      const result = sanitizeLeadInput(input);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+1-234-567-8900');
      expect(result.company).toBe('Acme Corp');
      expect(result.status).toBe('new');
      expect(result.notes).toBe('Some notes here');
    });

    it('should handle null values', () => {
      const input = {
        name: 'John Doe',
        email: null,
        phone: null,
        company: null,
        status: 'new',
        notes: null,
      };

      const result = sanitizeLeadInput(input);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe(null);
      expect(result.phone).toBe(null);
      expect(result.company).toBe(null);
      expect(result.notes).toBe(null);
    });
  });

  describe('sanitizeInteractionInput', () => {
    it('should sanitize interaction fields', () => {
      const input = {
        lead_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'call',
        description: '  Discussed pricing  ',
      };

      const result = sanitizeInteractionInput(input);
      expect(result.lead_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.type).toBe('call');
      expect(result.description).toBe('Discussed pricing');
    });
  });
});
