import { supabaseClientManager } from './supabase-manager';
import { createClient } from '@supabase/supabase-js';

// Get the Human resources management client with proper isolation
export const supabase = supabaseClientManager.getClient({
  serviceName: 'ff-hrms-6860',
  storageKey: 'supabase.auth.hr-management',
  options: {
  },
});

// Note: Service role key removed from .env.local
// For server-side operations requiring admin access, create client directly in API routes if needed
// Most operations should use RLS with anon key instead

// Helper functions for ff-hrms-6860
export async function getUserHospitalId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('entity_platform_id')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('[ff-hrms-6860] Error fetching user hospital ID:', error);
    return null;
  }
  
  return data?.entity_platform_id || null;
}







// Export manager for cross-service coordination
export { supabaseClientManager };

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  console.log(`[ff-hrms-6860] Client manager active with ${supabaseClientManager.getClientCount()} total clients`);
}