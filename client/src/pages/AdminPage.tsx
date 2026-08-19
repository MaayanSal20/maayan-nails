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
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })

  const statusLabel: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'מאושר',
    cancelled: 'בוטל',
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

        {/* טבלת תורים */}
        <div className="bg-cream rounded-2xl p-6">
          <h3 className="font-serif text-wine mb-4">ניהול תורים</h3>
          <div className="flex flex-col gap-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blush rounded-xl p-4"
              >
                <div>
                  <p className="font-sans text-wine font-semibold">
                    {a.guestName} · {a.service}
                  </p>
                  <p className="font-sans text-wine/70 text-sm">
                    {formatDate(a.date)} · {a.guestPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-wine/10 text-wine px-3 py-1 rounded-full font-sans">
                    {statusLabel[a.status] || a.status}
                  </span>

                  {a.status !== 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(a.id, 'confirmed')}
                      disabled={updatingId === a.id}
                      className="bg-rose text-cream px-3 py-1 rounded-full text-sm font-sans hover:bg-wine transition-colors disabled:opacity-50"
                    >
                      אישור
                    </button>
                  )}
                  {a.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(a.id, 'cancelled')}
                      disabled={updatingId === a.id}
                      className="border border-rose text-wine px-3 py-1 rounded-full text-sm font-sans hover:bg-pink/20 transition-colors disabled:opacity-50"
                    >
                      ביטול
                    </button>
                  )}
                </div>
              </div>
            ))}
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