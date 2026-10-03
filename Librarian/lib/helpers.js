export const today = () => new Date().toISOString().slice(0, 10)
export const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '?'
export const money = (value) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value || 0)
export const daysLate = (due) => Math.max(0, Math.floor((new Date(`${today()}T00:00:00`) - new Date(`${due}T00:00:00`)) / 86400000))
export const normalizeEmail = (email) => email.trim().toLowerCase()
export async function hashPassword(password, saltHex = null) {
  const salt = saltHex ? Uint8Array.from(saltHex.match(/.{2}/g), (byte) => parseInt(byte, 16)) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256)
  const passwordHash = [...new Uint8Array(derived)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  const passwordSalt = [...salt].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return { passwordHash, passwordSalt }
}
export async function verifyPassword(password, account) {
  if (!account?.passwordHash || !account.passwordSalt) return false
  const result = await hashPassword(password, account.passwordSalt)
  return result.passwordHash === account.passwordHash
}
