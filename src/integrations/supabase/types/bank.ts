export interface BankConnection {
  id: string;
  user_id: string | null;
  bank_name: string;
  account_number: string;
  routing_number: string;
  created_at: string;
}