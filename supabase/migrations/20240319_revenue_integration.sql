-- Enable row level security
ALTER TABLE IF EXISTS public.revenue_records REPLICA IDENTITY FULL;

-- Create bank_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bank_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    bank_name TEXT NOT NULL,
    account_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, account_id)
);

-- Enable RLS on bank_connections
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

-- Add bank_connections to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bank_connections;

-- Create policy for bank_connections
CREATE POLICY "Users can manage their own bank connections"
ON public.bank_connections
FOR ALL
TO authenticated
USING (auth.uid() = user_id);