import nailsImg from '../assets/nails.jpg'
function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-blush pt-24 px-6"
    >
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        {/* placeholder לתמונה - תחליפי ל-img כשיהיו תמונות */}
        <img
            src={nailsImg}
            className="w-40 h-40 rounded-full object-cover border-4 border-pink/40"
            alt="Maayan Nails - עיצוב ציפורניים"
        />

        <h2 className="text-4xl md:text-6xl font-serif text-wine">
          Maayan Nails
        </h2>

        <p className="text-lg md:text-xl text-wine/80 font-sans max-w-xl">
          סטודיו בוטיק לעיצוב ציפורניים – טיפוח, אלגנטיות ותשומת לב לכל פרט
        </p>

      </div>
    </section>
  )
}

export default Hero