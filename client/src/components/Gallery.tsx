import img1 from '../assets/nails.jpg'

const galleryImages = [
  { id: 1, src: img1, alt: 'עיצוב ציפורניים 1' },
  // כשיהיו לך עוד תמונות, תוסיפי כאן שורות נוספות באותו פורמט:
  // { id: 2, src: img2, alt: 'עיצוב ציפורניים 2' },
]

function Gallery() {
  return (
    <section id="gallery" className="py-20 px-6 bg-blush">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-wine mb-4">גלריה</h2>
        <p className="text-wine/70 font-sans mb-12">כמה מהעבודות האחרונות שלנו</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image) => (
            <div key={image.id} className="aspect-square overflow-hidden rounded-xl">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery