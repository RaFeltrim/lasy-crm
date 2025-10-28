/**
 * Database type definitions for Supabase tables
 * Generated based on the database schema
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'pending' | 'lost' | 'won';

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'other';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  notes: string | null;
}

export interface Interaction {
  id: string;
  lead_id: string;
  type: InteractionType;
  description: string;
  created_at: string;
  user_id: string;
}

// Insert types (without auto-generated fields)
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

export type InteractionInsert = Omit<Interaction, 'id' | 'created_at'>;

// Update types (all fields optional except id)
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

export type InteractionUpdate = Partial<Omit<Interaction, 'id' | 'created_at' | 'user_id'>>;

// Database schema type for Supabase client
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          status: LeadStatus;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          status?: LeadStatus;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          status?: LeadStatus;
          notes?: string | null;
        };
      };
      interactions: {
        Row: {
          id: string;
          lead_id: string;
          type: InteractionType;
          description: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: InteractionType;
          description: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: InteractionType;
          description?: string;
          created_at?: string;
          user_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
