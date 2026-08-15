import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  onOpenAuth: () => void
}

function Header({ onOpenAuth }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="bg-cream/90 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-pink/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif text-wine">Maayan Nails</h1>

        <nav className="hidden md:flex gap-8 text-wine font-sans items-center">
          <Link to="/#home" className="hover:text-rose transition-colors">בית</Link>
          <Link to="/#services" className="hover:text-rose transition-colors">שירותים</Link>
          <Link to="/#gallery" className="hover:text-rose transition-colors">גלריה</Link>
          <Link to="/#contact" className="hover:text-rose transition-colors">צור קשר</Link>
          {user && (
            <Link to="/account" className="hover:text-rose transition-colors">
              האזור האישי שלי
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-rose transition-colors">
              ניהול
            </Link>

          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-wine font-sans">שלום {user.name.split(' ')[0]}</span>
              <button onClick={logout} className="text-rose text-sm underline font-sans">
                התנתקי
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="border-2 border-rose text-wine px-5 py-2 rounded-full font-sans hover:bg-blush transition-colors"
            >
              התחברי
            </button>
          )}

          <Link
            to="/booking"
            className="bg-rose text-cream px-5 py-2 rounded-full font-sans hover:bg-wine transition-colors"
          >
            קביעת תור
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-wine text-3xl"
          aria-label="פתח תפריט"
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-cream shadow-lg transform transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-pink/30">
          <span className="font-serif text-wine text-xl">תפריט</span>
          <button onClick={() => setIsOpen(false)} className="text-wine text-2xl">✕</button>
        </div>

        <nav className="flex flex-col gap-6 p-6 text-wine font-sans text-lg">
          <Link to="/#home" onClick={() => setIsOpen(false)}>בית</Link>
          <Link to="/#services" onClick={() => setIsOpen(false)}>שירותים</Link>
          <Link to="/#gallery" onClick={() => setIsOpen(false)}>גלריה</Link>
          <Link to="/#contact" onClick={() => setIsOpen(false)}>צור קשר</Link>

          {user && (
            <Link to="/account" onClick={() => setIsOpen(false)}>
              האזור האישי שלי
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsOpen(false)}>
              ניהול
            </Link>
          )}

          {user ? (
            <>
              <span className="text-wine">שלום {user.name.split(' ')[0]}</span>
              <button onClick={logout} className="text-rose underline text-right">
                התנתקי
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false)
                onOpenAuth()
              }}
              className="border-2 border-rose text-wine px-5 py-2 rounded-full text-center"
            >
              התחברי
            </button>
          )}

          <Link
            to="/booking"
            onClick={() => setIsOpen(false)}
            className="bg-rose text-cream px-5 py-2 rounded-full text-center"
          >
            קביעת תור
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header