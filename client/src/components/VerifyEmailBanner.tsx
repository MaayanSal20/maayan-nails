import { useState } from 'react'
import { verifyEmail, resendVerification } from '../api'
import { useAuth } from '../context/AuthContext'

function VerifyEmailBanner() {
  const { user, login } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [closed, setClosed] = useState(false)

  if (!user || user.emailVerified === 'true' || success || closed) return null

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyEmail(user.token, code)
      login({ ...user, emailVerified: 'true' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await resendVerification(user.token)
      setResent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    }
  }

  return (
    <div
      onClick={() => setClosed(true)}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-2xl p-8 max-w-sm w-full relative"
      >
        <button
          onClick={() => setClosed(true)}
          className="absolute top-4 left-4 text-wine text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-serif text-wine text-center mb-3">אימות אימייל</h2>
        <p className="text-wine/70 font-sans text-sm text-center mb-6">
          שלחנו קוד לכתובת האימייל שלך. יש לאמת אותה כדי שתוכלי לקבוע תורים.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="קוד אימות"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-pink/40 rounded-full px-4 py-2 font-sans text-center tracking-widest focus:outline-none focus:border-rose"
            required
          />

          {error && <p className="text-rose text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-rose text-cream py-2 rounded-full font-sans hover:bg-wine transition-colors disabled:opacity-50"
          >
            {loading ? 'רגע...' : 'אימות'}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="text-wine/60 text-sm underline block text-center mt-4 w-full"
        >
          {resent ? 'נשלח שוב ✓' : 'שליחת קוד חוזרת'}
        </button>
      </div>
    </div>
  )
}

export default VerifyEmailBanner