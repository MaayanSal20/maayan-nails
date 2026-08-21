import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getNotifications, markNotificationRead, deleteNotification } from '../api'
import { useAuth } from '../context/AuthContext'

type Notification = {
    id: string
    message: string
    type: string
    appointmentId: string | null
    read: string
    createdAt: string
}

function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const prevCountRef = useRef<number>(0)
    const navigate = useNavigate()

    const unreadCount = notifications.filter((n) => String(n.read) === 'false').length

    useEffect(() => {
        audioRef.current = new Audio(
            'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
        )
    }, [])

    useEffect(() => {
        if (!user) return

        const fetchNotifications = () => {
            getNotifications(user.token)
                .then((data: Notification[]) => {
                    const newUnread = data.filter((n) => String(n.read) === 'false').length
                    if (newUnread > prevCountRef.current && prevCountRef.current !== 0) {
                        audioRef.current?.play().catch(() => { })
                    }
                    prevCountRef.current = newUnread
                    setNotifications(data)
                })
                .catch(() => { })
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 15000)
        return () => clearInterval(interval)
    }, [user])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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

    const handleNotificationClick = async (n: Notification) => {
        await handleMarkRead(n.id)
        setIsOpen(false)

        if (n.type === 'appointment_confirmed' || n.type === 'appointment_cancelled') {
            navigate('/account')
        } else if (n.type === 'new_appointment' || n.type === 'cancel_request') {
            navigate('/admin')
        }
    }

    const handleBellClick = async () => {
        const willOpen = !isOpen
        setIsOpen(willOpen)

        if (willOpen && user) {
            const unread = notifications.filter((n) => String(n.read) === 'false')
            for (const n of unread) {
                await markNotificationRead(user.token, n.id)
            }
            setNotifications((prev) => prev.map((n) => ({ ...n, read: 'true' })))
        }
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('he-IL', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        })

    if (!user) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleBellClick} className="relative text-wine p-1">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 ring-2 ring-white shadow-sm">
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
                                <div
                                    key={n.id}
                                    className={`flex items-start justify-between gap-2 px-4 py-3 border-b border-blush last:border-0 hover:bg-blush transition-colors ${String(n.read) === 'false' ? 'bg-pink/5' : ''
                                        }`}
                                >
                                    <button onClick={() => handleNotificationClick(n)} className="flex-1 text-right">
                                        <p className="text-wine font-sans text-sm">{n.message}</p>
                                        <p className="text-wine/40 font-sans text-xs mt-1">{formatDate(n.createdAt)}</p>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(n.id)}
                                        className="text-wine/30 hover:text-red-500 text-sm flex-shrink-0 mt-1"
                                        aria-label="מחיקת התראה"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <Link
                        to="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block text-center py-2 text-pink-dark text-sm font-sans hover:bg-blush transition-colors border-t border-blush"
                    >
                        כל ההתראות
                    </Link>
                </div>
            )}
        </div>
    )
}

export default NotificationBell