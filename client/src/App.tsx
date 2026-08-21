import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import NotificationsPage from './pages/NotificationsPage'
import { trackPageView } from './api'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const location = useLocation()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (lastTrackedPath.current === location.pathname) return
    lastTrackedPath.current = location.pathname
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>

      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}

export default App