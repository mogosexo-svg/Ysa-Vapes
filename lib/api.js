'use client'

export const API = '/api'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cd_token')
}

export function setToken(t) {
  if (typeof window === 'undefined') return
  if (t) localStorage.setItem('cd_token', t)
  else localStorage.removeItem('cd_token')
}

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(API + path, { ...opts, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'error' }))
    throw new Error(err.error || 'Error')
  }
  return res.json()
}

export function trackWhatsAppClick(data = {}) {
  const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  fetch(API + '/whatsapp-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, device, source: typeof window !== 'undefined' ? window.location.pathname : '/' })
  }).catch(() => {})
}

export function openWhatsApp({ number, message }) {
  const cleaned = String(number || '').replace(/[^0-9]/g, '')
  const url = 'https://wa.me/' + cleaned + '?text=' + encodeURIComponent(message || '')
  window.open(url, '_blank')
}

export function buildProductMessage(product, storeUrl) {
  const priceStr = product.price ? '$' + product.price : ''
  const url = storeUrl + '/products/' + product.slug
  return 'Hola, estoy interesado en el producto ' + product.name + (priceStr ? ', con precio de ' + priceStr : '') + '. ' + url + ' ¿Está disponible?'
}
