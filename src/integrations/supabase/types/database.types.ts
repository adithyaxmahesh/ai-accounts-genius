import { FinancialTables } from './tables/financial';
import { TaxTables } from './tables/tax';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: FinancialTables & TaxTables;
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  }
}