import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import AccountPage from './pages/AccountPage'
import { trackPageView } from './api'
import AdminPage from './pages/AdminPage'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
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
      </Routes>

      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}

export default App