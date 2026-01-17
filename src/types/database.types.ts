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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_progress: {
        Row: {
          average_score: number | null
          created_at: string | null
          date: string
          id: string
          meals_logged: number | null
          meals_needs_attention: number | null
          meals_off_plan: number | null
          meals_on_plan: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          created_at?: string | null
          date: string
          id?: string
          meals_logged?: number | null
          meals_needs_attention?: number | null
          meals_off_plan?: number | null
          meals_on_plan?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          created_at?: string | null
          date?: string
          id?: string
          meals_logged?: number | null
          meals_needs_attention?: number | null
          meals_off_plan?: number | null
          meals_on_plan?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_constraints: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          is_approximate: boolean | null
          option_id: string
          portion_unit: string | null
          portion_value: number | null
          raw_text: string | null
          target: string | null
          type: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          is_approximate?: boolean | null
          option_id: string
          portion_unit?: string | null
          portion_value?: number | null
          raw_text?: string | null
          target?: string | null
          type: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          is_approximate?: boolean | null
          option_id?: string
          portion_unit?: string | null
          portion_value?: number | null
          raw_text?: string | null
          target?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_constraints_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "meal_options"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          adherence_score: number | null
          created_at: string | null
          detected_foods: Json | null
          detection_confidence: number | null
          id: string
          logged_at: string | null
          meal_type: string
          notes: string | null
          photo_path: string | null
          scored_at: string | null
          scoring_result: Json | null
          status: string
          updated_at: string | null
          user_corrections: Json | null
          user_id: string
        }
        Insert: {
          adherence_score?: number | null
          created_at?: string | null
          detected_foods?: Json | null
          detection_confidence?: number | null
          id?: string
          logged_at?: string | null
          meal_type: string
          notes?: string | null
          photo_path?: string | null
          scored_at?: string | null
          scoring_result?: Json | null
          status?: string
          updated_at?: string | null
          user_corrections?: Json | null
          user_id: string
        }
        Update: {
          adherence_score?: number | null
          created_at?: string | null
          detected_foods?: Json | null
          detection_confidence?: number | null
          id?: string
          logged_at?: string | null
          meal_type?: string
          notes?: string | null
          photo_path?: string | null
          scored_at?: string | null
          scoring_result?: Json | null
          status?: string
          updated_at?: string | null
          user_corrections?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      meal_options: {
        Row: {
          created_at: string | null
          id: string
          meal_slot_id: string
          option_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_slot_id: string
          option_number?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_slot_id?: string
          option_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_options_meal_slot_id_fkey"
            columns: ["meal_slot_id"]
            isOneToOne: false
            referencedRelation: "meal_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_references: {
        Row: {
          created_at: string | null
          id: string
          source_slot_id: string
          target_slot_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_slot_id: string
          target_slot_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          source_slot_id?: string
          target_slot_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_references_source_slot_id_fkey"
            columns: ["source_slot_id"]
            isOneToOne: false
            referencedRelation: "meal_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_references_target_slot_id_fkey"
            columns: ["target_slot_id"]
            isOneToOne: false
            referencedRelation: "meal_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_slots: {
        Row: {
          created_at: string | null
          display_order: number
          icon: string | null
          id: string
          name: string
          plan_id: string
          time_window: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          plan_id: string
          time_window?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          plan_id?: string
          time_window?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_slots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_templates: {
        Row: {
          allowed_foods: string[] | null
          calories_max: number | null
          calories_min: number | null
          created_at: string | null
          disallowed_foods: string[] | null
          id: string
          macros: Json | null
          option_id: string | null
          plan_id: string
          required_foods: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_foods?: string[] | null
          calories_max?: number | null
          calories_min?: number | null
          created_at?: string | null
          disallowed_foods?: string[] | null
          id?: string
          macros?: Json | null
          option_id?: string | null
          plan_id: string
          required_foods?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_foods?: string[] | null
          calories_max?: number | null
          calories_min?: number | null
          created_at?: string | null
          disallowed_foods?: string[] | null
          id?: string
          macros?: Json | null
          option_id?: string | null
          plan_id?: string
          required_foods?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_templates_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "meal_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_templates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          daily_targets: Json | null
          id: string
          is_active: boolean | null
          name: string
          source: string | null
          updated_at: string | null
          upload_id: string | null
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          daily_targets?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          source?: string | null
          updated_at?: string | null
          upload_id?: string | null
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          daily_targets?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          source?: string | null
          updated_at?: string | null
          upload_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "plan_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_uploads: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_path: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_path: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_progress: {
        Row: {
          average_score: number | null
          created_at: string | null
          id: string
          meals_logged: number | null
          meals_on_plan: number | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          average_score?: number | null
          created_at?: string | null
          id?: string
          meals_logged?: number | null
          meals_on_plan?: number | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          average_score?: number | null
          created_at?: string | null
          id?: string
          meals_logged?: number | null
          meals_on_plan?: number | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
