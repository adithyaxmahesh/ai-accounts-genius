export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_insights: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string
          id: string
          insight: string
          user_id: string | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight: string
          user_id?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          insight?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_items: {
        Row: {
          amount: number | null
          audit_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          status: string | null
        }
        Insert: {
          amount?: number | null
          audit_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          status?: string | null
        }
        Update: {
          amount?: number | null
          audit_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_items_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_reports: {
        Row: {
          created_at: string
          description: string | null
          document_id: string | null
          findings: Json | null
          id: string
          recommendations: string[] | null
          risk_level: string | null
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_reports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "processed_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_sheet_items: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balance_sheet_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_insights: {
        Row: {
          category: string
          created_at: string
          id: string
          metrics: Json | null
          priority: string | null
          recommendations: string[] | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          metrics?: Json | null
          priority?: string | null
          recommendations?: string[] | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          metrics?: Json | null
          priority?: string | null
          recommendations?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_type: string | null
          created_at: string
          findings: Json | null
          id: string
          recommendations: string[] | null
          risk_level: string | null
          user_id: string | null
        }
        Insert: {
          check_type?: string | null
          created_at?: string
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          user_id?: string | null
        }
        Update: {
          check_type?: string | null
          created_at?: string
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_patterns: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          id: string
          is_expense: boolean | null
          pattern: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string
          id?: string
          is_expense?: boolean | null
          pattern: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          id?: string
          is_expense?: boolean | null
          pattern?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence_level: number | null
          created_at: string
          factors: Json | null
          id: string
          period_end: string
          period_start: string
          predicted_revenue: number
          user_id: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          period_end: string
          period_start: string
          predicted_revenue: number
          user_id?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          predicted_revenue?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json | null
          id: string
          risk_score: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json | null
          id?: string
          risk_score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          risk_score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_analytics: {
        Row: {
          created_at: string
          demand_forecast: Json | null
          id: string
          item_category: string | null
          optimization_suggestions: Json | null
          reorder_points: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          demand_forecast?: Json | null
          id?: string
          item_category?: string | null
          optimization_suggestions?: Json | null
          reorder_points?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          demand_forecast?: Json | null
          id?: string
          item_category?: string | null
          optimization_suggestions?: Json | null
          reorder_points?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_documents: {
        Row: {
          confidence_score: number | null
          created_at: string
          document_type: string | null
          extracted_data: Json | null
          id: string
          original_filename: string
          processing_status: string | null
          storage_path: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          id?: string
          original_filename: string
          processing_status?: string | null
          storage_path: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          id?: string
          original_filename?: string
          processing_status?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id: string
          role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      receipt_analysis: {
        Row: {
          confidence_score: number | null
          created_at: string
          extracted_data: Json | null
          id: string
          location: string | null
          receipt_url: string | null
          suggested_tax_codes: Json | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          location?: string | null
          receipt_url?: string | null
          suggested_tax_codes?: Json | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          location?: string | null
          receipt_url?: string | null
          suggested_tax_codes?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      state_operations: {
        Row: {
          compliance_status: string | null
          created_at: string
          id: string
          operation_type: string | null
          state: string | null
          tax_implications: Json | null
          user_id: string | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string
          id?: string
          operation_type?: string | null
          state?: string | null
          tax_implications?: Json | null
          user_id?: string | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string
          id?: string
          operation_type?: string | null
          state?: string | null
          tax_implications?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_operations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_analysis: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          jurisdiction: string | null
          recommendations: Json | null
          tax_impact: number | null
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          tax_impact?: number | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          tax_impact?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_codes: {
        Row: {
          category: string
          code: string
          created_at: string
          deduction_type: string
          description: string
          expense_category: string | null
          id: string
          state: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          deduction_type: string
          description: string
          expense_category?: string | null
          id?: string
          state?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          deduction_type?: string
          description?: string
          expense_category?: string | null
          id?: string
          state?: string | null
        }
        Relationships: []
      }
      tax_planning_chats: {
        Row: {
          answer: string | null
          context: Json | null
          created_at: string
          id: string
          question: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          question?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          question?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_planning_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notifications: boolean | null
          theme: string | null
        }
        Insert: {
          created_at?: string
          id: string
          notifications?: boolean | null
          theme?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: boolean | null
          theme?: string | null
        }
        Relationships: []
      }
      write_offs: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          status: string | null
          tax_code_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          status?: string | null
          tax_code_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string | null
          tax_code_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "write_offs_tax_code_id_fkey"
            columns: ["tax_code_id"]
            isOneToOne: false
            referencedRelation: "tax_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "write_offs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

