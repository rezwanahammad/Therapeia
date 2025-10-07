import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function check() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        if (!res.ok) {
          if (!cancelled) {
            setAuthorized(false)
            navigate('/admin/login', { replace: true })
          }
          return
        }
        if (!cancelled) {
          setAuthorized(true)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not verify admin session')
          setAuthorized(false)
          navigate('/admin/login', { replace: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [navigate])

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <p>Checking admin authorization…</p>
      </div>
    )
  }
  if (!authorized) {
    // Navigation will have occurred; render nothing
    return null
  }
  return children
}