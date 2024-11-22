import type { FinancialHealthMetrics } from './financial';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      financial_health_metrics: {
        Row: FinancialHealthMetrics;
        Insert: Omit<FinancialHealthMetrics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FinancialHealthMetrics, 'id' | 'created_at' | 'updated_at'>>;
      };
      financial_goals: {
        Row: {
          id: string
          user_id: string | null
          name: string
          target_amount: number
          current_amount: number | null
          start_date: string
          end_date: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          target_amount: number
          current_amount?: number | null
          start_date?: string
          end_date: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          target_amount?: number
          current_amount?: number | null
          start_date?: string
          end_date?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_deadlines: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          due_date: string
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          due_date: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          status?: string | null
          created_at?: string
        }
      }
      tax_planning_scenarios: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          scenario_data: Json | null
          estimated_tax_impact: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          scenario_data?: Json | null
          estimated_tax_impact?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          scenario_data?: Json | null
          estimated_tax_impact?: number | null
          created_at?: string
        }
      }
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
          risk_level?: string
          status: string
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
          risk_level?: string
          status?: string
          title?: string
          user_id?: string | null
        }
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
      }
      irs_publications: {
        Row: {
          content: string
          created_at: string
          effective_date: string
          expiration_date: string | null
          id: string
          publication_number: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          effective_date: string
          expiration_date?: string | null
          id: string
          publication_number: string
          title: string
          updated_at: string
        }
        Update: {
          content?: string
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          id?: string
          publication_number?: string
          title?: string
          updated_at?: string
        }
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
      }
      tax_code_rules: {
        Row: {
          created_at: string
          id: string
          priority: number
          tax_code_id: string | null
          tax_rule_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: number
          tax_code_id?: string | null
          tax_rule_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          priority?: number
          tax_code_id?: string | null
          tax_rule_id?: string | null
        }
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
      }
      bank_connections: {
        Row: {
          id: string;
          user_id: string | null;
          bank_name: string;
          account_number: string;
          routing_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          bank_name: string;
          account_number: string;
          routing_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          bank_name?: string;
          account_number?: string;
          routing_number?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  }
}
