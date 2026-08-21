import { useEffect, useState } from 'react'
import { getGalleryImages } from '../api'

type GalleryImage = {
  id: string
  url: string
  alt: string | null
}

function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    getGalleryImages().then(setImages)
  }, [])

  const loopImages = images.length > 0 ? [...images, ...images] : []

  return (
    <section id="gallery" className="py-24 bg-blush overflow-hidden">
      <div className="max-w-5xl mx-auto text-center px-6 mb-12">
        <p className="text-pink-dark font-sans text-sm tracking-widest mb-3">קצת השראה</p>
        <h2 className="text-4xl md:text-5xl font-serif text-wine mb-3">גלריה</h2>
        <p className="text-wine/60 font-sans">כמה מהעבודות האחרונות שלנו</p>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-wine/50 font-sans">בקרוב יתווספו תמונות</p>
      ) : (
        <div className="relative group">
          <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] w-max">
            {loopImages.map((image, i) => (
              <div
                key={`${image.id}-${i}`}
                className="w-56 h-56 md:w-72 md:h-72 flex-shrink-0 rounded-3xl overflow-hidden ring-4 ring-white shadow-md"
              >
                <img
                  src={image.url}
                  alt={image.alt || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Gallery