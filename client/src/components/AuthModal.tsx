import { useState, useEffect } from 'react'
import { registerUser, loginUser } from '../api'
import { useAuth } from '../context/AuthContext'


type Props = {
  isOpen: boolean
  onClose: () => void
}

function AuthModal({ isOpen, onClose }: Props) {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setMode('login')
      setName('')
      setPhone('')
      setPassword('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const user = await registerUser({ name, phone, password })
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
          {mode === 'login' ? 'התחברות' : 'הרשמה'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-pink/40 rounded-full px-4 py-2 font-sans focus:outline-none focus:border-rose"
              required
            />
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

        <p className="text-center text-wine/70 text-sm mt-4 font-sans">
          {mode === 'login' ? 'עדיין אין לך חשבון?' : 'כבר יש לך חשבון?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-rose underline"
          >
            {mode === 'login' ? 'הירשמי כאן' : 'התחברי כאן'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal