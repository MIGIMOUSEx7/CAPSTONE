import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, onAuthChange } from '../api/supabaseApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const profile = await api.me()
      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
    const { data: { subscription } } = onAuthChange(() => loadUser())
    return () => subscription.unsubscribe()
  }, [loadUser])

  const login = async (email, password) => {
    await api.login(email, password)
    const profile = await api.me()
    setUser(profile)
    return profile
  }

  const register = async (form) => {
    await api.register({
      ...form,
      role: form.role === 'WHOLESALER' ? 'STALL_OPERATOR' : form.role,
    })
    const profile = await api.me()
    setUser(profile)
    return profile
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const isOperator = user?.role === 'STALL_OPERATOR' || user?.role === 'WHOLESALER'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isOperator, isWholesaler: isOperator }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
