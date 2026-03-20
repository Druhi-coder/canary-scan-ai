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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          ai_analysis: string | null
          created_at: string
          debug_data: Json | null
          form_data: Json | null
          id: string
          input_summary: Json | null
          medical_report: Json | null
          predictions: Json
          ranked_factors: Json | null
          top_features: Json | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          debug_data?: Json | null
          form_data?: Json | null
          id?: string
          input_summary?: Json | null
          medical_report?: Json | null
          predictions: Json
          ranked_factors?: Json | null
          top_features?: Json | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          debug_data?: Json | null
          form_data?: Json | null
          id?: string
          input_summary?: Json | null
          medical_report?: Json | null
          predictions?: Json
          ranked_factors?: Json | null
          top_features?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      datasets: {
        Row: {
          column_count: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          row_count: number | null
          sample_data: Json | null
          schema_info: Json | null
          source: string
          status: string
          user_id: string
        }
        Insert: {
          column_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          row_count?: number | null
          sample_data?: Json | null
          schema_info?: Json | null
          source?: string
          status?: string
          user_id: string
        }
        Update: {
          column_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          row_count?: number | null
          sample_data?: Json | null
          schema_info?: Json | null
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      experiments: {
        Row: {
          confusion_matrix: Json | null
          created_at: string
          dataset_id: string | null
          feature_importance: Json | null
          hyperparameters: Json | null
          id: string
          metrics: Json | null
          model_type: string
          model_version: string | null
          name: string
          notes: string | null
          roc_data: Json | null
          shap_values: Json | null
          status: string
          training_duration_ms: number | null
          user_id: string
        }
        Insert: {
          confusion_matrix?: Json | null
          created_at?: string
          dataset_id?: string | null
          feature_importance?: Json | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_type: string
          model_version?: string | null
          name: string
          notes?: string | null
          roc_data?: Json | null
          shap_values?: Json | null
          status?: string
          training_duration_ms?: number | null
          user_id: string
        }
        Update: {
          confusion_matrix?: Json | null
          created_at?: string
          dataset_id?: string | null
          feature_importance?: Json | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_type?: string
          model_version?: string | null
          name?: string
          notes?: string | null
          roc_data?: Json | null
          shap_values?: Json | null
          status?: string
          training_duration_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
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
  public: {
    Enums: {},
  },
} as const
