import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import './Notification.css'

const NotificationsContext = createContext({ notify: () => {} })

export const useNotifications = () => useContext(NotificationsContext)

const TYPES = {
  success: { icon: '✅', bg: '#e8f5e9', border: '#c8e6c9', titleColor: '#2e7d32' },
  info: { icon: 'ℹ️', bg: '#e3f2fd', border: '#bbdefb', titleColor: '#1565c0' },
  error: { icon: '❌', bg: '#ffebee', border: '#ffcdd2', titleColor: '#c62828' },
}

export default function NotificationProvider({ children }) {
  const [items, setItems] = useState([])
  const idRef = useRef(1)

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notify = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = idRef.current++
    const payload = { id, title, message, type }
    setItems((prev) => [...prev, payload])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [remove])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {items.map((n) => {
          const style = TYPES[n.type] || TYPES.info
          return (
            <div key={n.id} className="toast" style={{ background: style.bg, borderColor: style.border }}>
              <div className="toast-icon" aria-hidden>{style.icon}</div>
              <div className="toast-content">
                <div className="toast-title" style={{ color: style.titleColor }}>{n.title}</div>
                {n.message && <div className="toast-message">{n.message}</div>}
              </div>
              <button className="toast-close" onClick={() => remove(n.id)} aria-label="Dismiss">×</button>
            </div>
          )
        })}
      </div>
    </NotificationsContext.Provider>
  )
}