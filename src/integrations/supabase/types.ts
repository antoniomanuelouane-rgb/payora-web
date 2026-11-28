export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      affiliations: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          producer_id: string
          product_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          producer_id: string
          product_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          producer_id?: string
          product_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      currency_limits: {
        Row: {
          currency: string
          fixed_fee: number
          max_withdrawal: number
          min_withdrawal: number
        }
        Insert: {
          currency: string
          fixed_fee?: number
          max_withdrawal: number
          min_withdrawal: number
        }
        Update: {
          currency?: string
          fixed_fee?: number
          max_withdrawal?: number
          min_withdrawal?: number
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string
          customer_email: string
          id: string
          order_id: string
          product_id: string
          revoked_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          id?: string
          order_id: string
          product_id: string
          revoked_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          id?: string
          order_id?: string
          product_id?: string
          revoked_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string
          id: string
          module_id: string
          position: number
          product_id: string
          title: string
          video_url: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          module_id: string
          position?: number
          product_id: string
          title: string
          video_url?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          module_id?: string
          position?: number
          product_id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          affiliate_commission: number
          affiliate_id: string | null
          amount_mzn: number
          available_at: string | null
          bump_product_id: string | null
          checkout_url: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          fee_percent_snapshot: number
          fixed_fee_snapshot: number
          gross_amount: number
          hold_days_snapshot: number
          id: string
          idempotency_key: string | null
          method: string
          net_amount: number
          paid_at: string | null
          platform_fee: number
          product_id: string
          provider: string
          provider_ref: string | null
          refund_reason: string | null
          refunded_at: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_commission?: number
          affiliate_id?: string | null
          amount_mzn: number
          available_at?: string | null
          bump_product_id?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          fee_percent_snapshot?: number
          fixed_fee_snapshot?: number
          gross_amount: number
          hold_days_snapshot?: number
          id?: string
          idempotency_key?: string | null
          method: string
          net_amount: number
          paid_at?: string | null
          platform_fee?: number
          product_id: string
          provider?: string
          provider_ref?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_commission?: number
          affiliate_id?: string | null
          amount_mzn?: number
          available_at?: string | null
          bump_product_id?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          fee_percent_snapshot?: number
          fixed_fee_snapshot?: number
          gross_amount?: number
          hold_days_snapshot?: number
          id?: string
          idempotency_key?: string | null
          method?: string
          net_amount?: number
          paid_at?: string | null
          platform_fee?: number
          product_id?: string
          provider?: string
          provider_ref?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_bump_product_id_fkey"
            columns: ["bump_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_key: string
          id: string
          order_id: string | null
          payload: Json
          provider: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          fee_percent: number
          hold_days: number
          id: number
          updated_at: string
        }
        Insert: {
          fee_percent?: number
          hold_days?: number
          id?: number
          updated_at?: string
        }
        Update: {
          fee_percent?: number
          hold_days?: number
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          affiliate_commission_percent: number
          affiliate_enabled: boolean
          billing_type: string
          category: string
          checkout_banner_url: string | null
          checkout_button_color: string
          created_at: string
          currency: string
          delivery_url: string | null
          description: string
          google_analytics_id: string | null
          guarantee_days: number
          id: string
          image_url: string | null
          meta_pixel_id: string | null
          name: string
          order_bump_product_id: string | null
          price: number
          price_mzn: number
          scarcity_minutes: number
          slug: string
          tiktok_pixel_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          affiliate_commission_percent?: number
          affiliate_enabled?: boolean
          billing_type?: string
          category?: string
          checkout_banner_url?: string | null
          checkout_button_color?: string
          created_at?: string
          currency?: string
          delivery_url?: string | null
          description?: string
          google_analytics_id?: string | null
          guarantee_days?: number
          id?: string
          image_url?: string | null
          meta_pixel_id?: string | null
          name: string
          order_bump_product_id?: string | null
          price: number
          price_mzn?: number
          scarcity_minutes?: number
          slug: string
          tiktok_pixel_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          affiliate_commission_percent?: number
          affiliate_enabled?: boolean
          billing_type?: string
          category?: string
          checkout_banner_url?: string | null
          checkout_button_color?: string
          created_at?: string
          currency?: string
          delivery_url?: string | null
          description?: string
          google_analytics_id?: string | null
          guarantee_days?: number
          id?: string
          image_url?: string | null
          meta_pixel_id?: string | null
          name?: string
          order_bump_product_id?: string | null
          price?: number
          price_mzn?: number
          scarcity_minutes?: number
          slug?: string
          tiktok_pixel_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_order_bump_product_id_fkey"
            columns: ["order_bump_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          custom_fee_percent: number | null
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          custom_fee_percent?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          custom_fee_percent?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string
          provider_confirmed: boolean
          reason: string
          requested_by: string
          resolved_at: string | null
          seller_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          provider_confirmed?: boolean
          reason: string
          requested_by: string
          resolved_at?: string | null
          seller_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          provider_confirmed?: boolean
          reason?: string
          requested_by?: string
          resolved_at?: string | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          event: string
          id: string
          last_error: string | null
          last_status_code: number | null
          next_attempt_at: string
          payload: Json
          status: string
          user_id: string
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event: string
          id?: string
          last_error?: string | null
          last_status_code?: number | null
          next_attempt_at?: string
          payload: Json
          status?: string
          user_id: string
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event?: string
          id?: string
          last_error?: string | null
          last_status_code?: number | null
          next_attempt_at?: string
          payload?: Json
          status?: string
          user_id?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          active: boolean
          created_at: string
          events: string[]
          id: string
          secret: string
          url: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          secret: string
          url: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          secret?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account: string
          admin_note: string | null
          amount: number
          amount_mzn: number
          created_at: string
          currency: string
          id: string
          method: string
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          account: string
          admin_note?: string | null
          amount: number
          amount_mzn: number
          created_at?: string
          currency?: string
          id?: string
          method: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          account?: string
          admin_note?: string | null
          amount?: number
          amount_mzn?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
