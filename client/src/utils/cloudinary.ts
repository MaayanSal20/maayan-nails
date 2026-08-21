const CLOUD_NAME = 'nronj6p5'
const UPLOAD_PRESET = 'maayan_nails_gallery'

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error?.message || 'שגיאה בהעלאת התמונה')
  }

  return data.secure_url
}