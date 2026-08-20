import { useEffect, useState, useRef } from 'react'
import { getNotifications, markNotificationRead } from '../api'
import { useAuth } from '../context/AuthContext'

type Notification = {
  id: string
  message: string
  read: string
  createdAt: string
}

function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => n.read === 'false').length

  useEffect(() => {
    if (!user) return

    const fetchNotifications = () => {
      getNotifications(user.token).then(setNotifications).catch(() => {})
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (unreadCount > 0 && isOpen === false) {
      // אפשר להוסיף כאן צליל בעתיד אם תרצי
    }
  }, [unreadCount])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  const handleMarkRead = async (id: string) => {
    if (!user) return
    await markNotificationRead(user.token, id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: 'true' } : n)))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('he-IL', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen} className="relative text-wine text-xl">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 bg-pink-dark text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-blush overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-blush">
            <p className="font-serif text-wine">התראות</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-wine/50 font-sans text-sm text-center py-6">אין התראות</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`w-full text-right px-4 py-3 border-b border-blush last:border-0 hover:bg-blush transition-colors ${
                    n.read === 'false' ? 'bg-pink/5' : ''
                  }`}
                >
                  <p className="text-wine font-sans text-sm">{n.message}</p>
                  <p className="text-wine/40 font-sans text-xs mt-1">{formatDate(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell