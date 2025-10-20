import { supabaseAdmin } from './supabase'

interface SubscriptionCheck {
  allowed: boolean
  subscription: any
  error?: string
}

/**
 * Validates if an entity has access to the HR module
 */
export async function validateHRAccess(entityPlatformId: string): Promise<SubscriptionCheck> {
  try {
    // First, get the hospital by entity_platform_id
    const { data: hospital, error: hospitalError } = await supabaseAdmin
      .from('hospital_master')
      .select('id, entity_platform_id, subscription_status')
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

    // Check if hospital has active subscription
    if (hospital.subscription_status !== 'active') {
      return {
        allowed: false,
        subscription: { status: hospital.subscription_status },
        error: `Hospital subscription is ${hospital.subscription_status}`
      }
    }

    // Check if hospital is subscribed to HR module
    const { data: moduleSubscription, error: moduleError } = await supabaseAdmin
      .from('hospital_module_subscriptions')
      .select(`
        id,
        subscription_status,
        modules_master (
          module_name,
          module_code,
          solution_type
        )
      `)
      .eq('hospital_id', hospital.id)
      .eq('modules_master.module_code', 'HR')
      .eq('modules_master.solution_type', 'HMS')
      .eq('subscription_status', 'active')
      .single()

    if (moduleError || !moduleSubscription) {
      return {
        allowed: false,
        subscription: hospital,
        error: 'HR module not subscribed or inactive'
      }
    }

    return {
      allowed: true,
      subscription: {
        hospital,
        module: moduleSubscription
      }
    }

  } catch (error) {
    console.error('Error validating HR access:', error)
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