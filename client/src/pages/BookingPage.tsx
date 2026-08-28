import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailableSlots, createAppointment, getServices } from '../api'
import { useAuth } from '../context/AuthContext'

function BookingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [servicesList, setServicesList] = useState<{ id: string; name: string }[]>([])

  const [guestName, setGuestName] = useState(user?.name || '')
  const [guestPhone, setGuestPhone] = useState(user?.phone || '')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [note, setNote] = useState('')

  useEffect(() => {
    setGuestName(user?.name || '')
    setGuestPhone(user?.phone || '')
  }, [user])

  useEffect(() => {
    getServices().then(setServicesList)
  }, [])

  useEffect(() => {
    if (!date) {
      setAvailableSlots([])
      return
    }

    setLoadingSlots(true)
    setTime('')
    getAvailableSlots(date)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [date])

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!service || !date || !time || !guestName || !guestPhone) {
      setError('נא למלא את כל השדות')
      return
    }

    const validPrefixes = ['050', '052', '053', '054', '055', '058']
    if (guestPhone.length !== 10 || !/^\d+$/.test(guestPhone) || !validPrefixes.includes(guestPhone.slice(0, 3))) {
      setError('מספר טלפון לא תקין - יש להזין מספר ישראלי תקין (למשל 0501234567)')
      return
    }

    setSubmitting(true)
    try {
      const localDate = new Date(`${date}T${time}:00`)

      await createAppointment({
        service,
        date: localDate.toISOString(),
        guestName,
        guestPhone,
        note: note || undefined,
        userId: user?.id,
      })
      setSuccess(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בקביעת התור')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 px-6 bg-blush">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-wine mb-3">הבקשה נשלחה!</h1>
          <p className="text-wine/70 font-sans mb-4">
            הבקשה שלך ממתינה לאישור מיוצרת הסטודיו. תקבלי הודעה כשהתור יאושר.
          </p>
          <p className="text-wine/50 font-sans text-sm">מעבירה אותך לדף הבית...</p>
        </div>
      </section>
    )
  }

  if (user && user.emailVerified !== 'true') {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 px-6 bg-blush">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif text-wine mb-3">נדרש אימות אימייל</h1>
          <p className="text-wine/70 font-sans">
            לפני קביעת תור, יש לאמת את כתובת האימייל שלך. בדקי את תיבת הדואר שלך, או השתמשי בפס העליון באתר לאימות.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 bg-blush">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-serif text-wine text-center mb-8">קביעת תור</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-cream rounded-2xl p-6">
          <div>
            <label className="block text-wine font-sans text-sm mb-2">שירות</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            >
              <option value="">בחרי שירות</option>
              {servicesList.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-wine font-sans text-sm mb-2">תאריך</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
          </div>

          {date && (
            <div>
              <label className="block text-wine font-sans text-sm mb-2">שעה</label>
              {loadingSlots ? (
                <p className="text-wine/60 font-sans text-sm">טוענת שעות פנויות...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-wine/60 font-sans text-sm">אין שעות פנויות בתאריך זה</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`py-2 rounded-full font-sans text-sm transition-colors ${time === slot
                        ? 'bg-rose text-cream'
                        : 'bg-blush text-wine border border-pink/40 hover:bg-pink/30'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-wine font-sans text-sm mb-2">שם מלא</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
          </div>

          <div>
            <label className="block text-wine font-sans text-sm mb-2">טלפון</label>
            <input
              type="tel"
              dir="rtl"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
          </div>

          <div>
            <label className="block text-wine font-sans text-sm mb-2">הערה (אופציונלי)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="למשל: אלרגיה מסוימת, בקשה מיוחדת..."
              className="w-full border border-pink/40 rounded-2xl px-4 py-2 font-sans focus:outline-none focus:border-rose resize-none"
            />
          </div>

          {error && <p className="text-rose text-sm text-center font-sans">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-rose text-cream py-3 rounded-full font-sans text-lg hover:bg-wine transition-colors disabled:opacity-50"
          >
            {submitting ? 'קובעת תור...' : 'קביעת תור'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default BookingPage