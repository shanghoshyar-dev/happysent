/**
 * Hand-written placeholder so the project type-checks before you generate
 * real types from your live Supabase project.
 *
 * Regenerate from the live schema with:
 *
 *   npm run db:types
 *
 * which runs `supabase gen types typescript --linked > src/types/database.ts`.
 *
 * Keep these shapes in sync with
 * `supabase/migrations/20260510120000_initial_schema.sql`.
 *
 * NOTE: shaped exactly like the output of `supabase gen types typescript` so
 * `@supabase/supabase-js` can do its query-time row inference.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "scheduled"
  | "sent_to_bakery"
  | "delivered"
  | "invoiced"
  | "cancelled";

export type CompanyStatus = "active" | "paused";
export type InvoiceStatus = "unpaid" | "paid";
export type ReminderType =
  | "14_days"
  | "7_days_bakery"
  | "7_days_company"
  | "1_day"
  | "day_of";

export type Database = {
  public: {
    Tables: {
      bakeries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          city: string;
          opening_hours: string | null;
          days_notice: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          city: string;
          opening_hours?: string | null;
          days_notice?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          city?: string;
          opening_hours?: string | null;
          days_notice?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      employee_add_digest: {
        Row: {
          id: string;
          company_id: string;
          digest_date: string;
          additions: Json;
          notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          digest_date: string;
          additions?: Json;
          notified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          digest_date?: string;
          additions?: Json;
          notified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_add_digest_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          contact_email: string;
          billing_email: string;
          bakery_id: string;
          price_per_cake: number;
          status: CompanyStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          contact_email: string;
          billing_email: string;
          bakery_id: string;
          price_per_cake: number;
          status?: CompanyStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          contact_email?: string;
          billing_email?: string;
          bakery_id?: string;
          price_per_cake?: number;
          status?: CompanyStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_bakery_id_fkey";
            columns: ["bakery_id"];
            isOneToOne: false;
            referencedRelation: "bakeries";
            referencedColumns: ["id"];
          },
        ];
      };
      company_applications: {
        Row: {
          id: string;
          contact_name: string;
          company_name: string;
          contact_email: string;
          contact_phone: string | null;
          message: string | null;
          status: "pending" | "approved" | "rejected";
          processed_at: string | null;
          created_company_id: string | null;
          created_at: string;
          terms_accepted_at: string | null;
          terms_document_version: string;
        };
        Insert: {
          id?: string;
          contact_name: string;
          company_name: string;
          contact_email: string;
          contact_phone?: string | null;
          message?: string | null;
          status?: "pending" | "approved" | "rejected";
          processed_at?: string | null;
          created_company_id?: string | null;
          created_at?: string;
          terms_accepted_at?: string | null;
          terms_document_version?: string;
        };
        Update: {
          id?: string;
          contact_name?: string;
          company_name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          message?: string | null;
          status?: "pending" | "approved" | "rejected";
          processed_at?: string | null;
          created_company_id?: string | null;
          created_at?: string;
          terms_accepted_at?: string | null;
          terms_document_version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_applications_created_company_id_fkey";
            columns: ["created_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          first_name: string;
          last_name: string;
          birthday: string;
          number_of_people: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          first_name: string;
          last_name: string;
          birthday: string;
          number_of_people?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          first_name?: string;
          last_name?: string;
          birthday?: string;
          number_of_people?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          employee_id: string;
          company_id: string;
          delivery_date: string;
          status: OrderStatus;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          company_id: string;
          delivery_date: string;
          status?: OrderStatus;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          company_id?: string;
          delivery_date?: string;
          status?: OrderStatus;
          price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      reminder_log: {
        Row: {
          id: string;
          employee_id: string;
          order_id: string;
          type: ReminderType;
          sent_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          order_id: string;
          type: ReminderType;
          sent_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          order_id?: string;
          type?: ReminderType;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_log_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminder_log_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          month: string;
          total_amount: number;
          status: InvoiceStatus;
          orders: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          month: string;
          total_amount: number;
          status?: InvoiceStatus;
          orders?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          month?: string;
          total_amount?: number;
          status?: InvoiceStatus;
          orders?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          id: string;
          level: "info" | "warn" | "error";
          context: string;
          message: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: "info" | "warn" | "error";
          context: string;
          message: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: "info" | "warn" | "error";
          context?: string;
          message?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: number;
          admin_email_override: string | null;
          default_price_per_cake: number;
          delivery_window_start: string;
          delivery_window_end: string;
          cancellation_days_before_delivery: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          admin_email_override?: string | null;
          default_price_per_cake?: number;
          delivery_window_start?: string;
          delivery_window_end?: string;
          cancellation_days_before_delivery?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          admin_email_override?: string | null;
          default_price_per_cake?: number;
          delivery_window_start?: string;
          delivery_window_end?: string;
          cancellation_days_before_delivery?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          excerpt: string | null;
          published_at: string | null;
          author: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          slug: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          excerpt?: string | null;
          published_at?: string | null;
          author: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          slug?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          excerpt?: string | null;
          published_at?: string | null;
          author?: string;
          is_published?: boolean;
        };
        Relationships: [];
      };
      contact_rate_limits: {
        Row: {
          bucket_key: string;
          window_start: string;
          hit_count: number;
          updated_at: string;
        };
        Insert: {
          bucket_key: string;
          window_start?: string;
          hit_count?: number;
          updated_at?: string;
        };
        Update: {
          bucket_key?: string;
          window_start?: string;
          hit_count?: number;
          updated_at?: string;
        };
        Relationships: [];
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
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
