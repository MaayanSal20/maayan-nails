import { useEffect, useState } from 'react'
import { getServices } from '../api'

type Service = {
  id: string
  name: string
  description: string | null
  price: string
  salePrice: string | null
  saleNote: string | null
}

function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices()
      .then(setServices)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="services" className="py-20 px-6 bg-cream">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-wine mb-4">השירותים שלנו</h2>
        <p className="text-wine/70 font-sans mb-12">כל טיפול מותאם אישית עבורך</p>

        {loading ? (
          <p className="text-wine/60 font-sans">טוענת שירותים...</p>
        ) : services.length === 0 ? (
          <p className="text-wine/60 font-sans">בקרוב יתווספו שירותים</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-blush rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-serif text-wine">{service.name}</h3>
                {service.description && (
                  <p className="text-wine/70 font-sans text-sm">{service.description}</p>
                )}
                {service.salePrice ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-wine/50 font-sans line-through text-sm">
                        {service.price}
                      </span>
                      <span className="text-rose font-sans font-bold text-lg">
                        {service.salePrice}
                      </span>
                    </div>
                    {service.saleNote && (
                      <span className="text-rose font-sans text-xs">{service.saleNote}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-rose font-sans font-semibold text-lg">
                    {service.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Services