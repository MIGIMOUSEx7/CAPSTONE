import { supabase } from '../lib/supabase'

const PRODUCT_SELECT = `
  *,
  profiles:operator_id (full_name, stall_number, market_location, is_verified)
`

const LISTING_SELECT = `
  *,
  products:product_id (${PRODUCT_SELECT}),
  profiles:operator_id (full_name, stall_number)
`

async function getSessionUserId() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!session) throw new Error('Not authenticated')
  return session.user.id
}

export const api = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
    return data.user
  },

  async register({ full_name, email, password, role, stall_number, buyer_type, phone_number }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
          stall_number,
          buyer_type,
          phone_number,
        },
      },
    })
    if (error) throw new Error(error.message)
    if (data.user) {
      await supabase.from('profiles').update({
        full_name,
        phone_number,
        role,
        stall_number: (role === 'STALL_OPERATOR' || role === 'WHOLESALER') ? stall_number : null,
        buyer_type: role === 'RESCUE_BUYER' ? (buyer_type || 'RETAILER') : null,
      }).eq('id', data.user.id)
    }
    return data.user
  },

  async dashboard() {
    const userId = await getSessionUserId()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (profileError) throw profileError

    const isOperator = profile?.role === 'STALL_OPERATOR'
    let query = supabase.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false })
    if (isOperator) {
      query = query.eq('operator_id', userId).neq('freshness_status', 'RED')
    } else {
      query = query.eq('is_listed', true).neq('freshness_status', 'RED').limit(10)
    }

    const { data: active_batches, error } = await query
    if (error) throw error

    return { active_batches: active_batches || [] }
  },

  async batches() {
    const userId = await getSessionUserId()
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('operator_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async marketplace(params = {}) {
    let query = supabase
      .from('marketplace_listings')
      .select(LISTING_SELECT)
      .eq('listing_status', 'ACTIVE')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (params.crop_type) {
      query = query.eq('products.crop_type', params.crop_type)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
  },
}
