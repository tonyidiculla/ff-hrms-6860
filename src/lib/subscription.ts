import { supabase } from './supabase'

interface SubscriptionCheck {
  allowed: boolean
  subscription: any
  error?: string
}

/**
 * Validates if an entity has access to the HR module
 * Note: This now uses regular client with RLS - ensure proper access policies are in place
 */
export async function validateHRAccess(entityPlatformId: string): Promise<SubscriptionCheck> {
  try {
    // Get hospital with subscribed modules using regular client (RLS enforced)
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospital_master')
      .select('id, entity_platform_id, entity_name, subscribed_modules, subscription_status')
      .eq('entity_platform_id', entityPlatformId)
      .eq('is_active', true)
      .single()

    if (hospitalError || !hospital) {
      return {
        allowed: false,
        subscription: null,
        error: 'Hospital not found or inactive'
      }
    }

    // Check if HR module is subscribed
    const hrModule = hospital.subscribed_modules?.find((m: any) => 
      m.module_name === 'human_resources' && m.status === 'active'
    );

    if (!hrModule) {
      return {
        allowed: false,
        subscription: hospital,
        error: 'Human Resources module not subscribed or inactive'
      }
    }

    return {
      allowed: true,
      subscription: {
        hospital,
        hrModule,
        status: 'active'
      }
    }

  } catch (error) {
    return {
      allowed: false,
      subscription: null,
      error: 'Internal error validating subscription'
    }
  }
}

/**
 * Extracts entity_platform_id from request headers or query params
 */
export function extractEntityPlatformId(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('entity_id') || 
         request.headers.get('x-entity-platform-id')
}