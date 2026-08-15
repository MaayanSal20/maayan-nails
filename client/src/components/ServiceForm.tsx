import { useState, useEffect } from 'react'

type Service = {
  id: string
  name: string
  description: string | null
  price: string
  salePrice: string | null
  saleNote: string | null
  active: string
}

type Props = {
  service: Service | null
  onSave: (data: {
    name: string
    description?: string
    price: string
    salePrice?: string
    saleNote?: string
  }) => Promise<void>
  onCancel: () => void
}

function ServiceForm({ service, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [saleNote, setSaleNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(service?.name || '')
    setDescription(service?.description || '')
    setPrice(service?.price || '')
    setSalePrice(service?.salePrice || '')
    setSaleNote(service?.saleNote || '')
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        name,
        description: description || undefined,
        price,
        salePrice: salePrice || undefined,
        saleNote: saleNote || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-blush rounded-xl p-4">
      <input
        type="text"
        placeholder="שם השירות"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-pink/40 rounded-full px-4 py-2 font-sans text-sm focus:outline-none focus:border-rose"
        required
      />
      <input
        type="text"
        placeholder="תיאור (אופציונלי)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-pink/40 rounded-full px-4 py-2 font-sans text-sm focus:outline-none focus:border-rose"
      />
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="מחיר (למשל 120₪)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="flex-1 border border-pink/40 rounded-full px-4 py-2 font-sans text-sm focus:outline-none focus:border-rose"
          required
        />
        <input
          type="text"
          placeholder="מחיר מבצע (אופציונלי)"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="flex-1 border border-pink/40 rounded-full px-4 py-2 font-sans text-sm focus:outline-none focus:border-rose"
        />
      </div>
      {salePrice && (
        <input
          type="text"
          placeholder="הערת מבצע (למשל: לזמן מוגבל!)"
          value={saleNote}
          onChange={(e) => setSaleNote(e.target.value)}
          className="border border-rose rounded-full px-4 py-2 font-sans text-sm focus:outline-none focus:border-wine"
        />
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-rose text-cream px-4 py-2 rounded-full text-sm font-sans hover:bg-wine transition-colors disabled:opacity-50"
        >
          {saving ? 'שומרת...' : 'שמירה'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-wine/30 text-wine px-4 py-2 rounded-full text-sm font-sans hover:bg-cream transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  )
}

export default ServiceForm