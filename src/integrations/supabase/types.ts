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
          findings: Json | null
          id: string
          recommendations: string[] | null
          risk_level: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          findings?: Json | null
          id?: string
          recommendations?: string[] | null
          risk_level?: string | null
          status?: string
          title?: string
        }
        Relationships: []
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
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          period_end: string
          period_start: string
          predicted_revenue: number
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          predicted_revenue?: number
        }
        Relationships: []
      }
      revenue_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      tax_codes: {
        Row: {
          category: string
          code: string
          created_at: string
          deduction_type: string
          description: string
          id: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          deduction_type: string
          description: string
          id?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          deduction_type?: string
          description?: string
          id?: string
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
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          status?: string | null
          tax_code_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string | null
          tax_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "write_offs_tax_code_id_fkey"
            columns: ["tax_code_id"]
            isOneToOne: false
            referencedRelation: "tax_codes"
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
