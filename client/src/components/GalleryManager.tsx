import { useEffect, useState } from 'react'
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../api'
import { uploadImageToCloudinary } from '../utils/cloudinary'
import { useAuth } from '../context/AuthContext'

type GalleryImage = {
  id: string
  url: string
  alt: string | null
}

function GalleryManager() {
  const { user } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getGalleryImages().then(setImages)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setError('')
    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file)
      const newImage = await addGalleryImage(user.token, { url })
      setImages((prev) => [newImage, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהעלאה')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    if (!confirm('למחוק תמונה זו?')) return
    await deleteGalleryImage(user.token, id)
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return (
    <div className="bg-cream rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-wine">ניהול גלריה</h3>
        <label className="bg-pink text-white px-4 py-1.5 rounded-full text-sm font-sans hover:bg-pink-dark transition-colors cursor-pointer">
          {uploading ? 'מעלה...' : '+ הוספת תמונה'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm font-sans mb-3">{error}</p>}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1 left-1 bg-black/60 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="מחיקת תמונה"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-wine/50 font-sans text-sm text-center py-6">אין תמונות בגלריה עדיין</p>
      )}
    </div>
  )
}

export default GalleryManager