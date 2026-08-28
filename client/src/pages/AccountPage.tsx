import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserAppointments, updateUser, verifyEmail, resendVerification } from '../api'
import { useAuth } from '../context/AuthContext'
import { requestCancelAppointment } from '../api'

type Appointment = {
  id: string
  service: string
  date: string
  status: string
  cancelRequested: string
}

function AccountPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    setName(user.name)
    setPhone(user.phone)

    getUserAppointments(user.id, user.token)
      .then(setAppointments)
      .finally(() => setLoadingAppointments(false))
  }, [user, navigate])

  if (!user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess(false)
    setSaving(true)

    try {
      const updated = await updateUser(user.id, user.token, { name, phone: user.phone })
      login({ ...user, ...updated })
      setEditSuccess(true)
      setTimeout(() => setEditSuccess(false), 3000)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError('')
    setVerifyLoading(true)
    try {
      await verifyEmail(user.token, verifyCode)
      login({ ...user, emailVerified: 'true' })
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setVerifyError('')
    try {
      await resendVerification(user.token)
      setResent(true)
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'שגיאה')
    }
  }

  const now = new Date()
  const upcoming = appointments
    .filter((a) => new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past = appointments
    .filter((a) => new Date(a.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const statusLabel: Record<string, string> = {
    pending: 'ממתין לאישור',
    confirmed: 'מאושר',
    cancelled: 'בוטל',
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })

  const handleCancelRequest = async (id: string) => {
    if (!user) return
    await requestCancelAppointment(user.token, id)
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, cancelRequested: 'true' } : a))
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 bg-blush">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-serif text-wine text-center">האזור האישי שלי</h1>

        {/* עריכת פרטים */}
        <div className="bg-cream rounded-2xl p-6">
          <h2 className="text-xl font-serif text-wine mb-4">פרטים אישיים</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-wine font-sans text-sm mb-2">שם מלא</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
                required
              />
            </div>

            <div>
              <label className="block text-wine font-sans text-sm mb-2">טלפון</label>
              <input
                type="tel"
                value={phone}
                disabled
                className="w-full border border-wine/10 bg-wine/5 rounded-full px-4 py-2 font-sans text-wine/50 cursor-not-allowed"
              />
              <p className="text-wine/40 font-sans text-xs mt-1">לא ניתן לשנות מספר טלפון</p>
            </div>

            {editError && <p className="text-rose text-sm text-center font-sans">{editError}</p>}
            {editSuccess && <p className="text-green-700 text-sm text-center font-sans">הפרטים עודכנו בהצלחה ✓</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-rose text-cream py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
            >
              {saving ? 'שומרת...' : 'שמירת שינויים'}
            </button>
          </form>
        </div>

        {/* אימות אימייל */}
        {user.emailVerified !== 'true' && (
          <div className="bg-cream rounded-2xl p-6 ring-2 ring-pink">
            <h2 className="text-xl font-serif text-wine mb-2">אימות אימייל</h2>
            <p className="text-wine/70 font-sans text-sm mb-4">
              כתובת האימייל שלך עדיין לא מאומתת. יש לאמת אותה כדי שתוכלי לקבוע תורים.
            </p>
            <form onSubmit={handleVerifyEmail} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="קוד אימות"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="flex-1 border border-pink/40 rounded-full px-4 py-2 font-sans text-center tracking-widest focus:outline-none focus:border-rose"
                required
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="bg-rose text-cream px-6 py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
              >
                {verifyLoading ? 'רגע...' : 'אימות'}
              </button>
            </form>
            {verifyError && <p className="text-rose text-sm font-sans mb-2">{verifyError}</p>}
            <button
              onClick={handleResendVerification}
              className="text-wine/60 text-sm underline"
            >
              {resent ? 'נשלח שוב ✓' : 'שליחת קוד חוזרת'}
            </button>
          </div>
        )}

        {/* התורים */}
        <div className="bg-cream rounded-2xl p-6">
          {loadingAppointments ? (
            <p className="text-center text-wine/60 font-sans">טוענת תורים...</p>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-serif text-wine mb-3">תורים עתידיים</h3>
                {upcoming.length === 0 ? (
                  <p className="text-wine/60 font-sans text-sm">אין תורים עתידיים</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcoming.map((a) => (
                      <div key={a.id} className="bg-blush rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-sans text-wine font-semibold">{a.service}</p>
                          <p className="font-sans text-wine/70 text-sm">{formatDate(a.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-rose text-cream px-3 py-1 rounded-full font-sans">
                            {a.cancelRequested === 'true' ? 'ממתין לביטול' : statusLabel[a.status] || a.status}
                          </span>
                          {a.status !== 'cancelled' && a.cancelRequested !== 'true' && (
                            <button
                              onClick={() => handleCancelRequest(a.id)}
                              className="text-xs border border-rose text-wine px-3 py-1 rounded-full font-sans hover:bg-cream transition-colors"
                            >
                              בקשת ביטול
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-serif text-wine mb-3">היסטוריית תורים</h3>
                {past.length === 0 ? (
                  <p className="text-wine/60 font-sans text-sm">אין תורים קודמים</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {past.map((a) => (
                      <div
                        key={a.id}
                        className="bg-cream border border-pink/30 rounded-xl p-4 flex justify-between items-center opacity-70"
                      >
                        <div>
                          <p className="font-sans text-wine font-semibold">{a.service}</p>
                          <p className="font-sans text-wine/70 text-sm">{formatDate(a.date)}</p>
                        </div>
                        <span className="text-xs bg-wine/20 text-wine px-3 py-1 rounded-full font-sans">
                          {statusLabel[a.status] || a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default AccountPage