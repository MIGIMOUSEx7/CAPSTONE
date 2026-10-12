import { supabase, BACKEND_URL } from '../lib/supabase'
import { computeDynamicPrice } from './pricing'

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
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return session.user.id
}

export const api = {
  // ── Auth ──────────────────────────────────────────
  async register({ full_name, email, phone_number, password, role, stall_number, buyer_type, avatar_url, market_location }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role, stall_number, buyer_type, phone_number, avatar_url, market_location },
      },
    })
    if (error) throw new Error(error.message)
    if (data.user) {
      await supabase.from('profiles').update({
        full_name,
        phone_number,
        role,
        avatar_url: avatar_url || '',
        market_location: market_location || '',
        stall_number: (role === 'STALL_OPERATOR' || role === 'WHOLESALER') ? stall_number : null,
        buyer_type: role === 'RESCUE_BUYER' ? (buyer_type || 'RETAILER') : null,
      }).eq('id', data.user.id)
    }
    return data.user
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data.user
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async sendPasswordResetEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
    return data
  },

  async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
    return data
  },

  async me() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    return {
      id: session.user.id,
      email: session.user.email,
      ...profile,
      role: profile?.role,
    }
  },

  // ── Dashboard ─────────────────────────────────────
  async dashboard() {
    const userId = await getSessionUserId()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
    const isOperator = profile?.role === 'STALL_OPERATOR'

    let productsQuery = supabase.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false })
    if (isOperator) {
      // Show only operator's active/listed batches in the dashboard so sold/removed ones disappear
      productsQuery = productsQuery.eq('operator_id', userId).eq('is_listed', true).neq('freshness_status', 'RED')
    } else {
      productsQuery = productsQuery.eq('is_listed', true).neq('freshness_status', 'RED').limit(10)
    }
    const { data: active_batches } = await productsQuery

    const { data: latestSensor } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { count: unread_notifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    const at_risk_count = (active_batches || []).filter((b) => b.freshness_status === 'AMBER').length

    return {
      active_batches: active_batches || [],
      live_temperature: latestSensor?.temperature_c ?? null,
      live_humidity: latestSensor?.humidity_rh ?? null,
      live_ethylene: latestSensor?.ethylene_ppm ?? null,
      unread_notifications: unread_notifications || 0,
      at_risk_count,
    }
  },

  // ── Products ──────────────────────────────────────
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

  async batch(id) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    const { data: predictions } = await supabase
      .from('spoilage_predictions')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(5)
    const { data: latestSensor } = await supabase
      .from('sensor_logs')
      .select('*')
      .eq('product_id', id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return {
      ...data,
      predictions: predictions || [],
      latest_temp: latestSensor?.temperature_c,
      latest_humidity: latestSensor?.humidity_rh,
      latest_ethylene: latestSensor?.ethylene_ppm,
    }
  },

  async createBatch(body) {
    const userId = await getSessionUserId()
    const status = body.freshness_status || 'GREEN'
    const pricing = computeDynamicPrice(
      body.base_price_per_kg || body.price_per_kg,
      body.quantity_kg,
      status,
      body.auto_discount_enabled !== false,
    )
    const payload = {
      operator_id: userId,
      crop_type: body.crop_type,
      quantity_kg: body.quantity_kg,
      base_price_per_kg: body.base_price_per_kg || body.price_per_kg || 0,
      current_price_per_kg: pricing.current_price_per_kg,
      discount_percent: pricing.discount_percent,
      auto_discount_enabled: body.auto_discount_enabled !== false,
      freshness_status: status,
      freshness_percent: body.freshness_percent ?? 100,
      predicted_shelf_life: body.predicted_shelf_life ?? 5,
      ml_confidence: body.ml_confidence,
      harvest_datetime: body.harvest_datetime || new Date().toISOString(),
      image_url: body.image_url || '',
      notes: body.notes || '',
      pickup_location: body.pickup_location || 'Bulua West Terminal',
      iot_node_id: body.iot_node_id || null,
      is_listed: status === 'AMBER' || body.is_listed,
    }
    const { data, error } = await supabase.from('products').insert(payload).select().single()
    if (error) throw new Error(error.message)

    await supabase.from('spoilage_predictions').insert({
      product_id: data.id,
      predicted_status: status,
      days_to_spoil: data.predicted_shelf_life,
      freshness_percent: data.freshness_percent,
      source: body.ml_confidence ? 'VISION_ML' : 'MANUAL',
    })

    if (data.is_listed && status !== 'RED') {
      await api._ensureListing(data)
    }
    return data
  },

  async _ensureListing(product) {
    const pricing = computeDynamicPrice(
      product.base_price_per_kg,
      product.quantity_kg,
      product.freshness_status,
      product.auto_discount_enabled,
    )
    const expires = new Date()
    expires.setDate(expires.getDate() + 2)
    const { data: listing, error: listErr } = await supabase.from('marketplace_listings').upsert({
      product_id: product.id,
      operator_id: product.operator_id,
      listed_price: pricing.listed_price,
      original_price: Number(product.base_price_per_kg) * Number(product.quantity_kg),
      discount_percent: pricing.discount_percent,
      listing_status: 'ACTIVE',
      expires_at: expires.toISOString(),
    }, { onConflict: 'product_id' }).select().single()
    if (listErr) {
      console.error('Listing upsert error', listErr)
      throw new Error(listErr.message || listErr)
    }
    console.debug('Listing upserted', listing)
    await supabase.from('products').update({ is_listed: true }).eq('id', product.id)
    return listing
  },

  async getListingByProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(LISTING_SELECT)
        .eq('product_id', productId)
        .maybeSingle()
      if (error) {
        console.error('getListingByProduct error', error)
        throw new Error(error.message || error)
      }
      console.debug('getListingByProduct', productId, data)
      return data
    } catch (err) {
      console.error('getListingByProduct exception', err)
      throw err
    }
  },

  async predict(id) {
    const { data: predictions } = await supabase
      .from('spoilage_predictions')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
    const latest = predictions?.[0]
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
    return {
      batch_id: id,
      product_id: id,
      status: latest?.predicted_status || product?.freshness_status,
      days_to_spoil: latest?.days_to_spoil || product?.predicted_shelf_life,
      freshness_percent: latest?.freshness_percent || product?.freshness_percent,
      chu_accumulated: latest?.chu_accumulated,
      vpd: latest?.vpd_value,
    }
  },

  async batchDetectionPercent(productId) {
    const since = new Date()
    since.setDate(since.getDate() - 21)
    const { data: preds, error } = await supabase
      .from('spoilage_predictions')
      .select('*')
      .eq('product_id', productId)
      .gte('created_at', since.toISOString())
    if (error) throw new Error(error.message || error)
    if (!preds || preds.length === 0) return { percent: 0, total: 0 }
    const flagged = preds.filter((p) => p.predicted_status !== 'GREEN').length
    return { percent: Math.round((flagged / preds.length) * 100), total: preds.length }
  },

  /** Analyze image via Django backend (ESP32-CAM / upload flow) */
  async analyzeFreshness(imageFile, cropType) {
    const form = new FormData()
    form.append('image', imageFile)
    form.append('crop_type', cropType)
    const res = await fetch(`${BACKEND_URL}/api/analyze-freshness/`, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || data.error || 'Analysis failed')
    return data
  },

  // ── Marketplace ───────────────────────────────────
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
    try {
      const { data, error } = await query
      if (error) {
        console.error('marketplace fetch error', error)
        throw new Error(error.message || error)
      }
      console.debug('marketplace fetch', params, (data || []).length)
      return data
    } catch (err) {
      console.error('marketplace exception', err)
      throw err
    }
  },

  async listing(id) {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(LISTING_SELECT)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // ── Notifications (in-app only) ───────────────────
  async notifications() {
    const userId = await getSessionUserId()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async markAllRead() {
    const userId = await getSessionUserId()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
  },

  async acknowledgeNotif(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  },

  subscribeNotifications(userId, callback) {
    const channel = supabase
      .channel(`notif-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, callback)
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  subscribeMarketplace(callback) {
    const channel = supabase
      .channel('marketplace-listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_listings' }, (payload) => callback(payload))
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  async saveListing(listingId) {
    const userId = await getSessionUserId()
    const { data, error } = await supabase.from('saved_listings').upsert({ listing_id: listingId, user_id: userId }, { onConflict: 'listing_id,user_id' }).select().single()
    if (error) throw new Error(error.message || error)
    return data
  },

  // ── Chat ──────────────────────────────────────────
  async chatThreads(archived = false) {
    const userId = await getSessionUserId()
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        marketplace_listings:listing_id (
          id, listed_price,
          products:product_id (crop_type, freshness_status, freshness_percent)
        ),
        operator:operator_id (full_name),
        buyer:buyer_id (full_name)
      `)
      .or(`operator_id.eq.${userId},buyer_id.eq.${userId}`)
      .eq('is_archived', archived)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async chatThread(id) {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        marketplace_listings:listing_id (
          id, listed_price,
          products:product_id (crop_type, freshness_status, freshness_percent)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*, profiles:sender_id(full_name)')
      .eq('thread_id', id)
      .order('sent_at', { ascending: true })
    return { ...data, messages: messages || [] }
  },

  async startChat(listingId) {
    const userId = await getSessionUserId()
    // Ensure only buyers can start chats
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
    // If the current user is an operator, return an existing thread for this listing (if any).
    // Operators should not create buyer threads from the client — buyers initiate chats.
    if (profile?.role === 'STALL_OPERATOR') {
      const { data: existing, error: existingErr } = await supabase.from('chat_threads').select('*').eq('listing_id', listingId).eq('operator_id', userId).maybeSingle()
      if (existingErr) {
        console.error('Error fetching operator chat thread', existingErr)
        throw new Error(existingErr.message || existingErr)
      }
      return existing || null
    }
    // Prefer server-side RPC `create_chat_thread` which enforces DB-level checks (RLS)
    try {
      // Skip RPC if previously discovered unavailable
      if (!window.__createChatRpcUnavailable) {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('create_chat_thread', { listing_id: listingId })
        if (!rpcErr && rpcData) {
          return Array.isArray(rpcData) ? rpcData[0] : rpcData
        }
        // mark RPC unavailable so we don't keep hitting a missing endpoint
        console.debug('create_chat_thread RPC returned error, falling back to client upsert')
        window.__createChatRpcUnavailable = true
      }
    } catch (e) {
      // RPC threw (404 or network); mark unavailable and continue to fallback.
      window.__createChatRpcUnavailable = true
      console.debug('RPC create_chat_thread threw, falling back to client upsert')
    }

    // Fallback: client-side upsert (kept for backwards compatibility)
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('operator_id')
      .eq('id', listingId)
      .single()
    const { data, error } = await supabase
      .from('chat_threads')
      .upsert({
        listing_id: listingId,
        operator_id: listing.operator_id,
        buyer_id: userId,
        is_archived: false,
        transaction_completed: false,
      }, { onConflict: 'listing_id,buyer_id' })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async sendMessage(threadId, message_text) {
    const userId = await getSessionUserId()
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ thread_id: threadId, sender_id: userId, message_text })
      .select()
      .single()
    if (error) throw new Error(error.message)
    await supabase.from('chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)

    const { data: thread } = await supabase.from('chat_threads').select('operator_id, buyer_id').eq('id', threadId).single()
    const recipientId = thread.operator_id === userId ? thread.buyer_id : thread.operator_id
    await supabase.from('notifications').insert({
      user_id: recipientId,
      notification_type: 'NEW_MESSAGE',
      title: 'New Message',
      message: message_text.slice(0, 120),
    })
    return data
  },

  /** Exit popup: archive if transaction completed */
  async completeTransaction(threadId, completed) {
    // fetch thread and participant ids
    const { data: thread } = await supabase.from('chat_threads').select('listing_id, operator_id, buyer_id').eq('id', threadId).single()

    if (completed) {
      // Archive thread and mark transaction complete
      await supabase.from('chat_threads').update({
        transaction_completed: true,
        is_archived: true,
        updated_at: new Date().toISOString(),
      }).eq('id', threadId)

      try {
        const currentUser = await getSessionUserId()
        // If operator performed the completion, mark listing sold and unlist product
        if (currentUser === thread.operator_id) {
          if (thread?.listing_id) {
            await supabase.from('marketplace_listings').update({ listing_status: 'SOLD' }).eq('id', thread.listing_id)
            const { data: listing } = await supabase.from('marketplace_listings').select('product_id').eq('id', thread.listing_id).single()
            if (listing?.product_id) {
              await supabase.from('products').update({ is_listed: false }).eq('id', listing.product_id)
            }
          }

          // Notify both participants
          try {
            const msg = 'Transaction completed — listing marked as sold.'
            if (thread.operator_id) {
              await supabase.from('notifications').insert({ user_id: thread.operator_id, notification_type: 'ORDER_UPDATE', title: 'Sale Completed', message: msg })
            }
            if (thread.buyer_id) {
              await supabase.from('notifications').insert({ user_id: thread.buyer_id, notification_type: 'ORDER_UPDATE', title: 'Sale Completed', message: msg })
            }
          } catch (nerr) {
            console.error('Error inserting notifications after completeTransaction', nerr)
          }
        } else {
          // Buyer marked completed — notify operator to finalize the sale (operator must mark listing sold)
          try {
            const msg = 'Buyer marked the transaction complete. Please mark the listing as sold in the Marketplace.'
            if (thread.operator_id) {
              await supabase.from('notifications').insert({ user_id: thread.operator_id, notification_type: 'ORDER_UPDATE', title: 'Buyer Completed', message: msg })
            }
            if (thread.buyer_id) {
              await supabase.from('notifications').insert({ user_id: thread.buyer_id, notification_type: 'ORDER_UPDATE', title: 'You marked complete', message: 'Thank you — the operator will finalize the sale.' })
            }
          } catch (nerr) {
            console.error('Error inserting buyer-complete notifications', nerr)
          }
        }
      } catch (e) {
        console.error('Error handling post-completion listing/product changes', e)
      }
    } else {
      await supabase.from('chat_threads').update({
        transaction_completed: false,
        is_archived: false,
        updated_at: new Date().toISOString(),
      }).eq('id', threadId)
    }
  },

  async nodes() {
    const userId = await getSessionUserId()
    const { data, error } = await supabase.from('iot_nodes').select('*').eq('operator_id', userId)
    if (error) throw new Error(error.message)
    return data
  },

  // Mark a listing as sold (operator action)
  async markListingSold(listingId) {
    const userId = await getSessionUserId()
    // Ensure operator owns the listing
    const { data: listing, error: lErr } = await supabase.from('marketplace_listings').select('operator_id, product_id').eq('id', listingId).single()
    if (lErr) throw new Error(lErr.message || lErr)
    if (listing.operator_id !== userId) throw new Error('Not authorized')
    await supabase.from('marketplace_listings').update({ listing_status: 'SOLD' }).eq('id', listingId)
    if (listing.product_id) {
      await supabase.from('products').update({ is_listed: false }).eq('id', listing.product_id)
    }
    return true
  },

  // Remove a batch (product) by operator — deletes product and cascades listing
  async removeBatch(productId) {
    const userId = await getSessionUserId()
    const { data: prod, error: pErr } = await supabase.from('products').select('operator_id').eq('id', productId).single()
    if (pErr) throw new Error(pErr.message || pErr)
    if (prod.operator_id !== userId) throw new Error('Not authorized')
    const { error: delErr } = await supabase.from('products').delete().eq('id', productId)
    if (delErr) throw new Error(delErr.message || delErr)
    return true
  },
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}
