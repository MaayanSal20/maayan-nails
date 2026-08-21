import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markNotificationRead, deleteNotification } from '../api'
import { useAuth } from '../context/AuthContext'

type Notification = {
  id: string
  message: string
  read: string
  createdAt: string
}

function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    getNotifications(user.token)
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleMarkRead = async (id: string) => {
    if (!user) return
    await markNotificationRead(user.token, id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: 'true' } : n)))
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    await deleteNotification(user.token, id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('he-IL', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  if (!user) return null

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 bg-blush">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-wine text-center mb-8">ההתראות שלי</h1>

        {loading ? (
          <p className="text-center text-wine/60 font-sans">טוענת...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-wine/60 font-sans">אין התראות</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-3 rounded-2xl p-4 ${
                  String(n.read) === 'false' ? 'bg-white ring-2 ring-pink' : 'bg-white/60'
                }`}
              >
                <button onClick={() => handleMarkRead(n.id)} className="flex-1 text-right">
                  <p className="text-wine font-sans">{n.message}</p>
                  <p className="text-wine/50 font-sans text-sm mt-1">{formatDate(n.createdAt)}</p>
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-wine/40 hover:text-pink-dark text-lg flex-shrink-0"
                  aria-label="מחיקת התראה"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NotificationsPage