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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          draft: Json | null
          id: string
          institution: string
          is_published: boolean
          location: string
          pending_delete: boolean
          period: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          degree: string
          draft?: Json | null
          id?: string
          institution: string
          is_published?: boolean
          location?: string
          pending_delete?: boolean
          period?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          degree?: string
          draft?: Json | null
          id?: string
          institution?: string
          is_published?: boolean
          location?: string
          pending_delete?: boolean
          period?: string
          sort_order?: number
        }
        Relationships: []
      }
      experience: {
        Row: {
          company: string
          created_at: string
          draft: Json | null
          highlights: Json
          id: string
          is_published: boolean
          location: string
          logo_url: string | null
          pending_delete: boolean
          period: string
          role: string
          sort_order: number
          tech_stack: Json
        }
        Insert: {
          company: string
          created_at?: string
          draft?: Json | null
          highlights?: Json
          id?: string
          is_published?: boolean
          location: string
          logo_url?: string | null
          pending_delete?: boolean
          period: string
          role: string
          sort_order?: number
          tech_stack?: Json
        }
        Update: {
          company?: string
          created_at?: string
          draft?: Json | null
          highlights?: Json
          id?: string
          is_published?: boolean
          location?: string
          logo_url?: string | null
          pending_delete?: boolean
          period?: string
          role?: string
          sort_order?: number
          tech_stack?: Json
        }
        Relationships: []
      }
      profile: {
        Row: {
          about: string
          availability: string
          draft: Json | null
          email: string
          github: string | null
          id: number
          instagram: string | null
          linkedin: string | null
          location: string
          name: string
          phone: string
          show_email: boolean
          show_hire_me: boolean
          show_phone: boolean
          show_resume: boolean
          stats: Json
          tagline: string
          title: string
          twitter: string | null
          updated_at: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          about: string
          availability?: string
          draft?: Json | null
          email: string
          github?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          location: string
          name: string
          phone: string
          show_email?: boolean
          show_hire_me?: boolean
          show_phone?: boolean
          show_resume?: boolean
          stats?: Json
          tagline: string
          title: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          about?: string
          availability?: string
          draft?: Json | null
          email?: string
          github?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          location?: string
          name?: string
          phone?: string
          show_email?: boolean
          show_hire_me?: boolean
          show_phone?: boolean
          show_resume?: boolean
          stats?: Json
          tagline?: string
          title?: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      publish_state: {
        Row: {
          has_pending: boolean
          id: number
          last_published_at: string | null
          updated_at: string
        }
        Insert: {
          has_pending?: boolean
          id?: number
          last_published_at?: string | null
          updated_at?: string
        }
        Update: {
          has_pending?: boolean
          id?: number
          last_published_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          color: string
          created_at: string
          draft: Json | null
          group_order: number
          group_title: string
          icon_key: string
          id: string
          is_published: boolean
          name: string
          pending_delete: boolean
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          draft?: Json | null
          group_order?: number
          group_title: string
          icon_key?: string
          id?: string
          is_published?: boolean
          name: string
          pending_delete?: boolean
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          draft?: Json | null
          group_order?: number
          group_title?: string
          icon_key?: string
          id?: string
          is_published?: boolean
          name?: string
          pending_delete?: boolean
          sort_order?: number
        }
        Relationships: []
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
      publish_drafts: { Args: never; Returns: Json }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
