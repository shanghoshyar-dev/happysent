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
  | "7_days_florist"
  | "7_days_company"
  | "1_day"
  | "day_of";

export type CelebrationFrequency = "every_year" | "twice_yearly" | "decade";
export type GiftType = "cake" | "flowers";
export type CakeSelectionStatus = "pending" | "customer" | "auto" | "default";

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
          catalog_pdf_path: string | null;
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
          catalog_pdf_path?: string | null;
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
          catalog_pdf_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      florists: {
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
      employee_change_requests: {
        Row: {
          id: string;
          status: "pending" | "approved" | "rejected";
          action_type: "add" | "remove";
          company_name: string;
          address: string;
          city: string;
          postal_code: string;
          submitted_by_email: string;
          message: string | null;
          number_of_people: number | null;
          employees: Json;
          matched_company_id: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          status?: "pending" | "approved" | "rejected";
          action_type: "add" | "remove";
          company_name: string;
          address: string;
          city: string;
          postal_code: string;
          submitted_by_email: string;
          message?: string | null;
          number_of_people?: number | null;
          employees?: Json;
          matched_company_id?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          status?: "pending" | "approved" | "rejected";
          action_type?: "add" | "remove";
          company_name?: string;
          address?: string;
          city?: string;
          postal_code?: string;
          submitted_by_email?: string;
          message?: string | null;
          number_of_people?: number | null;
          employees?: Json;
          matched_company_id?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_change_requests_matched_company_id_fkey";
            columns: ["matched_company_id"];
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
          contact_phone: string | null;
          bakery_id: string;
          offers_flowers: boolean;
          florist_id: string | null;
          price_per_cake: number;
          price_per_flowers: number | null;
          default_product_id: string | null;
          status: CompanyStatus;
          welcome_email_sent_at: string | null;
          portal_invite_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          contact_email: string;
          billing_email: string;
          contact_phone?: string | null;
          bakery_id: string;
          offers_flowers?: boolean;
          florist_id?: string | null;
          price_per_cake: number;
          price_per_flowers?: number | null;
          default_product_id?: string | null;
          status?: CompanyStatus;
          welcome_email_sent_at?: string | null;
          portal_invite_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          contact_email?: string;
          billing_email?: string;
          contact_phone?: string | null;
          bakery_id?: string;
          offers_flowers?: boolean;
          florist_id?: string | null;
          price_per_cake?: number;
          price_per_flowers?: number | null;
          default_product_id?: string | null;
          status?: CompanyStatus;
          welcome_email_sent_at?: string | null;
          portal_invite_sent_at?: string | null;
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
          {
            foreignKeyName: "companies_florist_id_fkey";
            columns: ["florist_id"];
            isOneToOne: false;
            referencedRelation: "florists";
            referencedColumns: ["id"];
          },
        ];
      };
      company_applications: {
        Row: {
          id: string;
          contact_name: string;
          company_name: string;
          organization_number: string | null;
          contact_email: string;
          contact_phone: string | null;
          employees_import_storage_path: string | null;
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
          organization_number?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          employees_import_storage_path?: string | null;
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
          organization_number?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          employees_import_storage_path?: string | null;
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
          celebration_frequency: CelebrationFrequency;
          gift_type: GiftType;
          is_active: boolean;
          preferred_product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          first_name: string;
          last_name: string;
          birthday: string;
          number_of_people?: number;
          celebration_frequency?: CelebrationFrequency;
          gift_type?: GiftType;
          is_active?: boolean;
          preferred_product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          first_name?: string;
          last_name?: string;
          birthday?: string;
          number_of_people?: number;
          celebration_frequency?: CelebrationFrequency;
          gift_type?: GiftType;
          is_active?: boolean;
          preferred_product_id?: string | null;
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
          {
            foreignKeyName: "employees_preferred_product_id_fkey";
            columns: ["preferred_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
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
          gift_type: GiftType;
          product_id: string | null;
          selection_token: string;
          selection_deadline: string | null;
          cake_selection_status: CakeSelectionStatus;
          selected_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          company_id: string;
          delivery_date: string;
          status?: OrderStatus;
          price: number;
          gift_type?: GiftType;
          product_id?: string | null;
          selection_token?: string;
          selection_deadline?: string | null;
          cake_selection_status?: CakeSelectionStatus;
          selected_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          company_id?: string;
          delivery_date?: string;
          status?: OrderStatus;
          price?: number;
          gift_type?: GiftType;
          product_id?: string | null;
          selection_token?: string;
          selection_deadline?: string | null;
          cake_selection_status?: CakeSelectionStatus;
          selected_at?: string | null;
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
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
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
          sent_at: string | null;
          pdf_downloaded_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          month: string;
          total_amount: number;
          status?: InvoiceStatus;
          orders?: Json;
          created_at?: string;
          sent_at?: string | null;
          pdf_downloaded_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          month?: string;
          total_amount?: number;
          status?: InvoiceStatus;
          orders?: Json;
          created_at?: string;
          sent_at?: string | null;
          pdf_downloaded_at?: string | null;
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
          bakery_id: string | null;
          description: string | null;
          dietary_notes: string | null;
          min_people: number | null;
          max_people: number | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          bakery_id?: string | null;
          description?: string | null;
          dietary_notes?: string | null;
          min_people?: number | null;
          max_people?: number | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          bakery_id?: string | null;
          description?: string | null;
          dietary_notes?: string | null;
          min_people?: number | null;
          max_people?: number | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_bakery_id_fkey";
            columns: ["bakery_id"];
            isOneToOne: false;
            referencedRelation: "bakeries";
            referencedColumns: ["id"];
          },
        ];
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
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      company_portal_invites: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_portal_invites_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      company_users: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
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
      donation_contributions: {
        Row: {
          invoice_id: string;
          order_count: number;
          amount_kr: number;
          created_at: string;
        };
        Insert: {
          invoice_id: string;
          order_count: number;
          amount_kr: number;
          created_at?: string;
        };
        Update: {
          invoice_id?: string;
          order_count?: number;
          amount_kr?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donation_contributions_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: true;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      donation_campaign_snapshots: {
        Row: {
          year: number;
          total_kr: number;
          closed_at: string;
          email_sent_at: string | null;
        };
        Insert: {
          year: number;
          total_kr: number;
          closed_at?: string;
          email_sent_at?: string | null;
        };
        Update: {
          year?: number;
          total_kr?: number;
          closed_at?: string;
          email_sent_at?: string | null;
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
      current_company_id: { Args: Record<string, never>; Returns: string | null };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_company_user: { Args: Record<string, never>; Returns: boolean };
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
