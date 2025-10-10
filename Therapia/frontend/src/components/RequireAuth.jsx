import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/auth'

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function check() {
      setChecking(true)
      try {
        // Prefer backend session validation; fall back to localStorage
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          setAuthorized(true)
        } else {
          const lsUser = getCurrentUser()
          if (lsUser?._id) {
            setAuthorized(true)
          } else {
            setAuthorized(false)
            navigate('/login', { replace: true })
          }
        }
      } catch {
        const lsUser = getCurrentUser()
        if (lsUser?._id) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
          navigate('/login', { replace: true })
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [navigate])

  if (checking) {
    return <div style={{ padding: 24 }}>Checking authorization…</div>
  }
  if (!authorized) {
    // Navigation to login has occurred
    return null
  }
  return children
}