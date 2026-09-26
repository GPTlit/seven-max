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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean | null
          body: string | null
          created_at: string | null
          id: string
          image_url: string | null
          kind: string | null
          link: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          body?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string | null
          link?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          body?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          kind?: string | null
          link?: string | null
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admitted_at: string | null
          booking_ref: string
          created_at: string | null
          full_name: string | null
          id: string
          payment_method: string | null
          phone: string | null
          quantity: number
          receipt_path: string | null
          screening_id: string
          seats: string[]
          status: string
          total_amount: number
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          admitted_at?: string | null
          booking_ref?: string
          created_at?: string | null
          full_name?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          quantity?: number
          receipt_path?: string | null
          screening_id: string
          seats: string[]
          status?: string
          total_amount?: number
          user_id?: string
          whatsapp?: string | null
        }
        Update: {
          admitted_at?: string | null
          booking_ref?: string
          created_at?: string | null
          full_name?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          quantity?: number
          receipt_path?: string | null
          screening_id?: string
          seats?: string[]
          status?: string
          total_amount?: number
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_screening_id_fkey"
            columns: ["screening_id"]
            isOneToOne: false
            referencedRelation: "screenings"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          category: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          price: number
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          price: number
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          price?: number
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          items: Json
          seat_info: string | null
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          items: Json
          seat_info?: string | null
          status?: string
          total_amount?: number
          user_id?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          seat_info?: string | null
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_rentals: {
        Row: {
          created_at: string | null
          email: string | null
          event_date: string | null
          event_type: string | null
          full_name: string
          guests: number | null
          id: string
          message: string | null
          phone: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          full_name: string
          guests?: number | null
          id?: string
          message?: string | null
          phone: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          event_type?: string | null
          full_name?: string
          guests?: number | null
          id?: string
          message?: string | null
          phone?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          companion_name: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          phone: string | null
          plan: string | null
          receipt_path: string | null
          status: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          companion_name?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          plan?: string | null
          receipt_path?: string | null
          status?: string
          user_id?: string
          valid_until?: string | null
        }
        Update: {
          companion_name?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          plan?: string | null
          receipt_path?: string | null
          status?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          age_rating: string | null
          cast_list: string[] | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          duration: string | null
          early_booking: boolean | null
          featured: boolean | null
          genre: string | null
          id: string
          poster_url: string | null
          rating: number | null
          title: string
          title_ar: string | null
          trailer_url: string | null
        }
        Insert: {
          age_rating?: string | null
          cast_list?: string[] | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          duration?: string | null
          early_booking?: boolean | null
          featured?: boolean | null
          genre?: string | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          title: string
          title_ar?: string | null
          trailer_url?: string | null
        }
        Update: {
          age_rating?: string | null
          cast_list?: string[] | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          duration?: string | null
          early_booking?: boolean | null
          featured?: boolean | null
          genre?: string | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          title?: string
          title_ar?: string | null
          trailer_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      screenings: {
        Row: {
          created_at: string | null
          date: string
          id: string
          movie_id: string
          price: number
          room: string | null
          time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          movie_id: string
          price?: number
          room?: string | null
          time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          movie_id?: string
          price?: number
          room?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "screenings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_occupied_seats: { Args: { _screening: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
