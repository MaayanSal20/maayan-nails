import { useState, useEffect } from 'react'
import { registerUser, loginUser, forgotPassword, resetPassword } from '../api'
import { useAuth } from '../context/AuthContext'

type Props = {
  isOpen: boolean
  onClose: () => void
}

function AuthModal({ isOpen, onClose }: Props) {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setMode('login')
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setConfirmPassword('')
      setResetCode('')
      setNewPassword('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validPrefixes = ['050', '052', '053', '054', '055', '058']
    if (phone.length !== 10 || !/^\d+$/.test(phone) || !validPrefixes.includes(phone.slice(0, 3))) {
      setError('מספר טלפון לא תקין - יש להזין מספר ישראלי תקין (למשל 0501234567)')
      return
    }

    if (mode === 'register' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('כתובת אימייל לא תקינה')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        const user = await registerUser({ name, phone, email, password })
        login(user, rememberMe)
      } else {
        const user = await loginUser({ phone, password })
        login(user, rememberMe)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(phone)
      setMode('reset')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword({ phone, code: resetCode, newPassword })
      setMode('login')
      setPassword('')
      setResetCode('')
      setNewPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-2xl p-8 max-w-sm w-full relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-wine text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-serif text-wine text-center mb-6">
          {mode === 'login' && 'התחברות'}
          {mode === 'register' && 'הרשמה'}
          {mode === 'forgot' && 'שכחתי סיסמה'}
          {mode === 'reset' && 'איפוס סיסמה'}
        </h2>

        {mode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            <p className="text-wine/60 font-sans text-sm text-center">
              הזיני את מספר הטלפון שלך, ותשלח הודעת אימייל עם קוד לאיפוס הסיסמה
            </p>
            <input
              type="tel"
              dir="rtl"
              placeholder="טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
            {error && <p className="text-rose text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-rose text-cream py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
            >
              {loading ? 'רגע...' : 'שליחת קוד'}
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-wine/70 text-sm underline"
            >
              חזרה להתחברות
            </button>
          </form>
        ) : mode === 'reset' ? (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <p className="text-wine/60 font-sans text-sm text-center">
              בדקי את תיבת האימייל שלך, והזיני כאן את הקוד יחד עם הסיסמה החדשה
            </p>
            <input
              type="text"
              placeholder="קוד אימות"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose text-center tracking-widest"
              required
            />
            <input
              type="password"
              dir="rtl"
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
            {error && <p className="text-rose text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-rose text-cream py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
            >
              {loading ? 'רגע...' : 'איפוס סיסמה'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <>
                <input
                  type="text"
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
                  required
                />
                <input
                  type="email"
                  placeholder="אימייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose text-right"
                  style={{ direction: 'rtl' }}
                  required
                />
              </>
            )}

            <input
              type="tel"
              dir="rtl"
              placeholder="טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />

            <input
              type="password"
              dir="rtl"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />

            {mode === 'register' && (
              <input
                type="password"
                dir="rtl"
                placeholder="אימות סיסמה"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
                required
              />
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-wine/60 text-xs underline text-left"
              >
                שכחת סיסמה?
              </button>
            )}

            <label className="flex items-center gap-2 text-wine/80 font-sans text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-rose"
              />
              הישארי מחוברת
            </label>

            {error && (
              <div className="text-center">
                <p className="text-rose text-sm">{error}</p>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-wine/70 text-xs underline mt-1"
                  >
                    עדיין אין לך חשבון? הירשמי כאן
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-rose text-cream py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
            >
              {loading ? 'רגע...' : mode === 'login' ? 'התחברי' : 'הירשמי'}
            </button>
          </form>
        )}

        {(mode === 'login' || mode === 'register') && (
          <p className="text-center text-wine/70 text-sm mt-4 font-sans">
            {mode === 'login' ? 'עדיין אין לך חשבון?' : 'כבר יש לך חשבון?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-rose underline"
            >
              {mode === 'login' ? 'הירשמי כאן' : 'התחברי כאן'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthModal