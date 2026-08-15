import { getVisitorId } from './utils/visitorId'

const API_URL = import.meta.env.VITE_API_URL

export async function registerUser(data: {
  name: string
  phone: string
  email?: string
  password: string
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בהרשמה')
  return result
}

export async function loginUser(data: { phone: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בהתחברות')
  return result
}

export async function getUserAppointments(userId: string) {
  const res = await fetch(`${API_URL}/appointments/user/${userId}`)
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בשליפת תורים')
  return result
}

export async function getAvailableSlots(date: string) {
  const res = await fetch(`${API_URL}/appointments/available?date=${date}`)
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בשליפת שעות')
  return result as string[]
}

export async function createAppointment(data: {
  service: string
  date: string
  guestName: string
  guestPhone: string
  userId?: string
}) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בקביעת התור')
  return result
}

export async function updateUser(userId: string, data: { name: string; phone: string; email?: string }) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה בעדכון פרטים')
  return result
}


export async function trackPageView(path: string) {
  try {
    await fetch(`${API_URL}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, visitorId: getVisitorId() }),
    })
  } catch {
    // שגיאת מעקב לא צריכה "לשבור" את חוויית המשתמשת - מתעלמים בשקט
  }
}

export async function getAdminStats(userId: string) {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { 'x-user-id': userId },
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function getAllAppointments(userId: string) {
  const res = await fetch(`${API_URL}/admin/appointments`, {
    headers: { 'x-user-id': userId },
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function updateAppointmentStatus(
  userId: string,
  appointmentId: string,
  status: string
) {
  const res = await fetch(`${API_URL}/admin/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ status }),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function getServices() {
  const res = await fetch(`${API_URL}/services`)
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function getAllServicesAdmin(userId: string) {
  const res = await fetch(`${API_URL}/admin/services`, {
    headers: { 'x-user-id': userId },
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function createService(
  userId: string,
  data: { name: string; description?: string; price: string; salePrice?: string; saleNote?: string }
) {
  const res = await fetch(`${API_URL}/admin/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function updateService(
  userId: string,
  id: string,
  data: { name: string; description?: string; price: string; salePrice?: string; saleNote?: string; active: string }
) {
  const res = await fetch(`${API_URL}/admin/services/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}

export async function deleteService(userId: string, id: string) {
  const res = await fetch(`${API_URL}/admin/services/${id}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userId },
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'שגיאה')
  return result
}