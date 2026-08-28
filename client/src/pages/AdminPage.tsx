import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  getAdminStats, getAllAppointments, updateAppointmentStatus,
  getAllServicesAdmin, createService, updateService, deleteService,
} from '../api'
import { useAuth } from '../context/AuthContext'
import ServiceForm from '../components/ServiceForm'
import GalleryManager from '../components/GalleryManager'

type Stats = {
  totalUsers: number
  newUsersThisMonth: number
  totalPageViews: number
  uniqueVisitors: number
  totalAppointments: number
  appointmentsByService: Record<string, number>
  appointmentsByStatus: Record<string, number>
}

type Appointment = {
  id: string
  service: string
  date: string
  status: string
  guestName: string
  guestPhone: string
  note: string | null
  cancelRequested: string
}

type Service = {
  id: string
  name: string
  description: string | null
  price: string
  salePrice: string | null
  saleNote: string | null
  active: string
}

const COLORS = ['#D4537E', '#ED93B1', '#72243E', '#FBEAF0']

function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState<Stats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isAddingService, setIsAddingService] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    if (user.role !== 'admin') {
      navigate('/')
      return
    }

    Promise.all([getAdminStats(user.token), getAllAppointments(user.token), getAllServicesAdmin(user.token)])
      .then(([statsData, appointmentsData, servicesData]) => {
        setStats(statsData)
        setAppointments(appointmentsData)
        setServices(servicesData)
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleStatusChange = async (id: string, status: string) => {
    if (!user) return
    setUpdatingId(id)
    try {
      const updated = await updateAppointmentStatus(user.token, id, status)
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveService = async (data: {
    name: string; description?: string; price: string; salePrice?: string; saleNote?: string
  }) => {
    if (!user) return

    if (editingService) {
      const updated = await updateService(user.token, editingService.id, {
        ...data,
        active: editingService.active,
      })
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setEditingService(null)
    } else {
      const created = await createService(user.token, data)
      setServices((prev) => [...prev, created])
      setIsAddingService(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!user) return
    if (!confirm('למחוק שירות זה?')) return
    await deleteService(user.token, id)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  const handleToggleActive = async (s: Service) => {
    if (!user) return
    const updated = await updateService(user.token, s.id, {
      name: s.name,
      description: s.description || undefined,
      price: s.price,
      salePrice: s.salePrice || undefined,
      saleNote: s.saleNote || undefined,
      active: s.active === 'true' ? 'false' : 'true',
    })
    setServices((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })

  const statusLabel: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'מאושר',
    cancelled: 'בוטל',
  }

  const buildWhatsAppLink = (a: Appointment) => {
    const dateStr = formatDate(a.date)
    let message = ''

    if (a.status === 'confirmed') {
      message = `שלום ${a.guestName}, כאן מעיין מ-Maayan Nails. התור שלך ל${a.service} בתאריך ${dateStr} אושר. נשמח לראותך.`
    } else if (a.status === 'cancelled') {
      message = `שלום ${a.guestName}, כאן מעיין מ-Maayan Nails. התור שלך ל${a.service} בתאריך ${dateStr} בוטל. ניתן לקבוע תור חדש דרך האתר.`
    } else {
      message = `שלום ${a.guestName}, כאן מעיין מ-Maayan Nails. קיבלנו את בקשתך לתור ${a.service} בתאריך ${dateStr}, נעדכן אותך בקרוב.`
    }

    const cleanPhone = a.guestPhone.replace(/^0/, '972')
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  if (!user || user.role !== 'admin') return null

  if (loading) {
    return (
      <section className="min-h-screen pt-28 px-6 text-center">
        <p className="text-wine/60 font-sans">טוענת נתונים...</p>
      </section>
    )
  }

  const serviceChartData = stats
    ? Object.entries(stats.appointmentsByService).map(([name, value]) => ({ name, value }))
    : []

  const statusChartData = stats
    ? Object.entries(stats.appointmentsByStatus).map(([name, value]) => ({
      name: statusLabel[name] || name,
      value,
    }))
    : []

  const now = new Date()
  const oneMonthAhead = new Date()
  oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const upcomingAppointments = appointments.filter((a) => {
    const d = new Date(a.date)
    return d >= now && d <= oneMonthAhead
  })

  const pastAppointments = appointments.filter((a) => {
    const d = new Date(a.date)
    return d < now && d >= oneWeekAgo
  })

  const renderAppointment = (a: Appointment, isPast: boolean) => {
    const isCancelled = a.status === 'cancelled'
    const showStrikethrough = isPast || isCancelled

    return (
      <div
        key={a.id}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-4 ${showStrikethrough
          ? 'bg-wine/5 opacity-60'
          : a.status === 'pending'
            ? 'bg-pink/10 ring-2 ring-pink'
            : 'bg-blush'
          }`}
      >
        <div>
          <p className={`font-sans text-wine font-semibold ${showStrikethrough ? 'line-through' : ''}`}>
            {!isPast && a.status === 'pending' && <span className="text-pink-dark">● </span>}
            {a.guestName} · {a.service}
          </p>
          <p className={`font-sans text-wine/70 text-sm ${showStrikethrough ? 'line-through' : ''}`}>
            {formatDate(a.date)} · {a.guestPhone}
          </p>
          {a.note && (
            <p className="font-sans text-wine/60 text-xs mt-1 bg-white/50 rounded-lg px-2 py-1 inline-block">
              📝 {a.note}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-3 py-1 rounded-full font-sans ${isCancelled ? 'bg-red-100 text-red-500' : 'bg-wine/10 text-wine'
            }`}>
            {statusLabel[a.status] || a.status}
          </span>

          {a.cancelRequested === 'true' && !isCancelled && (
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-sans">
              ⚠ בקשת ביטול
            </span>
          )}

          <a
            href={buildWhatsAppLink(a)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-sans hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.44.79 3.06 1.2 4.72 1.2h.02c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.42 1.33-1.94 1.4-.5.07-1.12.1-1.81-.11-.42-.13-.96-.32-1.65-.62-2.91-1.26-4.81-4.18-4.95-4.38-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.15.07.14.11.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.42.11.58-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.63-.18 1.31z" />
            </svg>
            שלח וואטסאפ
          </a>

          {!isPast && a.status !== 'confirmed' && (
            <button
              onClick={() => handleStatusChange(a.id, 'confirmed')}
              disabled={updatingId === a.id}
              className="bg-pink text-white px-3 py-1 rounded-full text-sm font-sans hover:bg-pink-dark transition-colors disabled:opacity-50"
            >
              אישור
            </button>
          )}
          {!isPast && a.status !== 'cancelled' && (
            <button
              onClick={() => handleStatusChange(a.id, 'cancelled')}
              disabled={updatingId === a.id}
              className="border border-pink text-wine px-3 py-1 rounded-full text-sm font-sans hover:bg-pink/20 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 bg-blush">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-serif text-wine text-center">אזור ניהול</h1>

        {/* כרטיסי סטטיסטיקה */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="משתמשות רשומות" value={stats?.totalUsers ?? 0} />
          <StatCard label="חדשות החודש" value={stats?.newUsersThisMonth ?? 0} />
          <StatCard label="כניסות לאתר" value={stats?.totalPageViews ?? 0} />
          <StatCard label="מבקרות ייחודיות" value={stats?.uniqueVisitors ?? 0} />
        </div>

        {/* גרפים */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-cream rounded-2xl p-6">
            <h3 className="font-serif text-wine mb-4">תורים לפי סוג שירות</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={serviceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ED93B133" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#D4537E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-cream rounded-2xl p-6">
            <h3 className="font-serif text-wine mb-4">תורים לפי סטטוס</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* תורים קרובים */}
        <div className="bg-cream rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-serif text-wine">תורים קרובים</h3>
            <span className="text-wine/40 text-xs font-sans">(חודש הקרוב)</span>
            {upcomingAppointments.filter((a) => a.status === 'pending').length > 0 && (
              <span className="bg-pink-dark text-white text-xs px-3 py-1 rounded-full font-sans">
                {upcomingAppointments.filter((a) => a.status === 'pending').length} ממתינים לאישור
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-wine/50 font-sans text-sm text-center py-4">אין תורים קרובים</p>
            ) : (
              [...upcomingAppointments]
                .sort((a, b) => {
                  if (a.status === 'pending' && b.status !== 'pending') return -1
                  if (a.status !== 'pending' && b.status === 'pending') return 1
                  return new Date(a.date).getTime() - new Date(b.date).getTime()
                })
                .map((a) => renderAppointment(a, false))
            )}
          </div>
        </div>

        {/* תורים מהשבוע האחרון */}
        <div className="bg-cream rounded-2xl p-6">
          <h3 className="font-serif text-wine mb-4">
            תורים מהשבוע האחרון <span className="text-wine/40 text-xs font-sans">(היסטוריה)</span>
          </h3>
          <div className="flex flex-col gap-3">
            {pastAppointments.length === 0 ? (
              <p className="text-wine/50 font-sans text-sm text-center py-4">אין תורים מהשבוע האחרון</p>
            ) : (
              [...pastAppointments]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((a) => renderAppointment(a, true))
            )}
          </div>
        </div>

        {/* ניהול שירותים */}
        <div className="bg-cream rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-wine">ניהול שירותים</h3>
            {!isAddingService && (
              <button
                onClick={() => setIsAddingService(true)}
                className="bg-rose text-cream px-4 py-1.5 rounded-full text-sm font-sans hover:bg-wine transition-colors"
              >
                + שירות חדש
              </button>
            )}
          </div>

          {isAddingService && (
            <div className="mb-4">
              <ServiceForm
                service={null}
                onSave={handleSaveService}
                onCancel={() => setIsAddingService(false)}
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {services.map((s) =>
              editingService?.id === s.id ? (
                <ServiceForm
                  key={s.id}
                  service={s}
                  onSave={handleSaveService}
                  onCancel={() => setEditingService(null)}
                />
              ) : (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-4 ${s.active === 'true' ? 'bg-blush' : 'bg-wine/5 opacity-60'
                    }`}
                >
                  <div>
                    <p className="font-sans text-wine font-semibold">{s.name}</p>
                    <p className="font-sans text-wine/70 text-sm">
                      {s.salePrice ? (
                        <>
                          <span className="line-through">{s.price}</span> → {s.salePrice}
                          {s.saleNote && <span className="text-rose"> ({s.saleNote})</span>}
                        </>
                      ) : (
                        s.price
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="text-xs border border-wine/30 text-wine px-3 py-1 rounded-full font-sans hover:bg-cream transition-colors"
                    >
                      {s.active === 'true' ? 'הסתרה' : 'הפעלה'}
                    </button>
                    <button
                      onClick={() => setEditingService(s)}
                      className="text-xs bg-rose text-cream px-3 py-1 rounded-full font-sans hover:bg-wine transition-colors"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="text-xs border border-rose text-wine px-3 py-1 rounded-full font-sans hover:bg-pink/20 transition-colors"
                    >
                      מחיקה
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <GalleryManager />
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-cream rounded-2xl p-5 text-center">
      <p className="text-3xl font-serif text-wine">{value}</p>
      <p className="text-wine/60 font-sans text-sm mt-1">{label}</p>
    </div>
  )
}

export default AdminPage