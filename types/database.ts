/**
 * Database type definitions for Supabase tables
 * Generated based on the database schema
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'pending' | 'lost' | 'won';

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'other';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
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

export type InteractionUpdate = Partial<Omit<Interaction, 'id' | 'created_at' | 'user_id'>> & {
  id: string;
};

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      interactions: {
        Row: Interaction;
        Insert: Omit<Interaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Interaction, 'id' | 'created_at' | 'user_id'>>;
      };
    };
  };
}
