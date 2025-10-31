import { supabase } from './supabase'

interface SubscriptionCheck {
  allowed: boolean
  subscription: any
  error?: string
}

/**
 * Validates if an entity has access to the HR module
 * Uses authenticated supabase client to respect RLS policies
 */
export async function validateHRAccess(entityPlatformId: string): Promise<SubscriptionCheck> {
  try {
    // First, get the hospital by entity_platform_id with subscribed modules
    // Using regular authenticated client instead of admin to work with RLS
    const { data: hospital, error: hospitalError } = await supabase
      .from('hospital_master')
      .select('id, entity_platform_id, subscription_status, subscribed_modules')
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

    // Check if hospital is subscribed to HR module from subscribed_modules field
    const subscribedModuleIds = hospital.subscribed_modules?.map((m: any) => m.module_id) || [];
    
    if (subscribedModuleIds.length === 0) {
      return {
        allowed: false,
        subscription: hospital,
        error: 'No modules subscribed'
      }
    }

    // Get HR module details
    const { data: hrModule, error: moduleError } = await supabase
      .from('modules_master')
      .select('id, module_name, code')
      .eq('code', 'HRM')
      .eq('is_active', true)
      .single();

    console.log('[HRMS Subscription] HR module lookup:', { hrModule, moduleError });

    if (moduleError || !hrModule) {
      return {
        allowed: false,
        subscription: hospital,
        error: 'HR module not found in system'
      }
    }

    console.log('[HRMS Subscription] Subscribed module IDs:', subscribedModuleIds);
    console.log('[HRMS Subscription] HR module ID:', hrModule.id);
    console.log('[HRMS Subscription] Is HR subscribed?', subscribedModuleIds.includes(hrModule.id));

    // Check if HR module is in subscribed modules
    if (!subscribedModuleIds.includes(hrModule.id)) {
      return {
        allowed: false,
        subscription: hospital,
        error: 'HR module not subscribed'
      }
    }

    return {
      allowed: true,
      subscription: {
        hospital,
        module: hrModule
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