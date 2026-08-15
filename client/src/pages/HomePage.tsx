import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Gallery from '../components/Gallery'
import Contact from '../components/Contact'

function HomePage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [location])

  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <Contact />
    </>
  )
}

export default HomePage