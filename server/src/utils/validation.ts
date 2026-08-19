export function isValidIsraeliPhone(phone: string): boolean {
  const validPrefixes = ['050', '052', '053', '054', '055', '058']
  const prefix = phone.slice(0, 3)
  return phone.length === 10 && /^\d+$/.test(phone) && validPrefixes.includes(prefix)
}