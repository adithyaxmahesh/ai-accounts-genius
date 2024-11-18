import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

const supabaseUrl = "https://nmrjqfntvxflkabdigfl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcmpxZm50dnhmbGthYmRpZ2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NDY0MTUsImV4cCI6MjA0NzEyMjQxNX0.fJHCYlrNYLHhcmsZzm1YzxDpz-eZiqDL1AtmZi8FP1s";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);