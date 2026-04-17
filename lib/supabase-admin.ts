import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[SupabaseAdmin] URL:', supabaseUrl ? 'set' : 'MISSING');
console.log('[SupabaseAdmin] Key present:', !!supabaseServiceRoleKey);
console.log('[SupabaseAdmin] Key preview:', supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 20) + '...' : 'none');

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

if (!supabaseAdmin) {
  console.error('[SupabaseAdmin] Failed to initialize - missing url or key');
}
