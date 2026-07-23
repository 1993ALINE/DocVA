import { useEffect, useState } from 'react'
import { settingsAPI } from './api'

/** Static fallback when `logo_data_url` is empty — file in `public/brand/`. */
export const DEFAULT_BRAND_LOGO_SRC = '/brand/docva-logo.jfif'

export const DEFAULT_BRANDING = {
  system_name: 'DOCVA',
  system_email: '',
  phone: '',
  address: '',
  company_info: '',
  footer_text: '',
  support_contact: '',
  social_links: {},
  logo_data_url: '',
  favicon_data_url: '',
  primary_color: '#2563eb',
  secondary_color: '#0d9488',
  system_description: 'Clinical documentation platform',
}

const STORAGE_KEY = 'docva_branding_settings'
const EVENT_NAME = 'docva:branding-updated'

export function normalizeBranding(data = {}) {
  const next = { ...DEFAULT_BRANDING, ...(data || {}) }
  if (next.social_links && typeof next.social_links === 'object') {
    const social = { ...next.social_links }
    delete social.__admin_meta
    next.social_links = social
  }
  return next
}

export function getCachedBranding() {
  try {
    return normalizeBranding(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))
  } catch {
    return { ...DEFAULT_BRANDING }
  }
}

/** Parse '#rgb' or '#rrggbb' into an [r,g,b] triple; falls back to black. */
function hexToRgb(hex) {
  const m = String(hex || '').trim().replace(/^#/, '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) {return [0, 0, 0]}
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Mix a hex color toward white (ratio > 0) or black (ratio < 0) by |ratio| (0-1). */
function mix(hex, ratio, toward = [255, 255, 255]) {
  const [r, g, b] = hexToRgb(hex)
  const t = Math.max(0, Math.min(1, Math.abs(ratio)))
  return rgbToHex([
    r + (toward[0] - r) * t,
    g + (toward[1] - g) * t,
    b + (toward[2] - b) * t,
  ])
}

/** Derive the full brand palette from just primary/secondary so every CSS
 * variable in global.css (which used to be hardcoded to the old default
 * blue) actually tracks whatever color is saved in Settings. */
function applyBrandColors(primary, secondary) {
  const root = document.documentElement.style
  root.setProperty('--brand-primary', primary)
  root.setProperty('--brand-primary-light', mix(primary, 0.28))
  root.setProperty('--brand-primary-dark', mix(primary, 0.24, [0, 0, 0]))
  root.setProperty('--brand-primary-ultra-light', mix(primary, 0.92))
  root.setProperty('--brand-secondary', secondary)
  root.setProperty('--brand-secondary-light', mix(secondary, 0.28))
  root.setProperty('--gradient-hero', `linear-gradient(135deg, ${primary} 0%, ${mix(primary, 0.3, hexToRgb(secondary))} 45%, ${secondary} 100%)`)
  root.setProperty('--gradient-btn', `linear-gradient(135deg, ${primary}, ${secondary})`)
  root.setProperty('--gradient-btn-hover', `linear-gradient(135deg, ${mix(primary, 0.24, [0, 0, 0])}, ${mix(secondary, 0.24, [0, 0, 0])})`)
}

export function applyBrandingToDocument(settings) {
  const s = normalizeBranding(settings)
  applyBrandColors(s.primary_color || DEFAULT_BRANDING.primary_color, s.secondary_color || DEFAULT_BRANDING.secondary_color)
  document.title = `${s.system_name || 'DOCVA'}`

  if (s.favicon_data_url) {
    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = s.favicon_data_url
  }
}

export function setBranding(settings) {
  const normalized = normalizeBranding(settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  applyBrandingToDocument(normalized)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: normalized }))
}

export async function refreshBranding() {
  const data = await settingsAPI.getPublic()
  setBranding(data.settings || {})
  return getCachedBranding()
}

export function useBranding() {
  const [branding, setBrandingState] = useState(() => getCachedBranding())

  useEffect(() => {
    applyBrandingToDocument(branding)
  }, [branding])

  useEffect(() => {
    let alive = true
    refreshBranding()
      .then((value) => { if (alive) {setBrandingState(value)} })
      .catch(() => {})
    const onUpdate = (event) => setBrandingState(normalizeBranding(event.detail))
    window.addEventListener(EVENT_NAME, onUpdate)
    return () => {
      alive = false
      window.removeEventListener(EVENT_NAME, onUpdate)
    }
  }, [])

  return branding
}


