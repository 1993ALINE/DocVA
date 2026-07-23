'use strict'

/**
 * HttpOnly session cookie for JWT auth (XSS-resistant).
 * Production uses __Host- prefix (Secure, Path=/, no Domain).
 */

const LEGACY_DEV_COOKIE = 'anot_session'
const PROD_COOKIE = '__Host-anot_session'

function getSessionCookieName() {
  return process.env.NODE_ENV === 'production' ? PROD_COOKIE : LEGACY_DEV_COOKIE
}

function parseJwtExpiresInToMs(expiresIn) {
  const raw = String(expiresIn || '1h').trim()
  const match = raw.match(/^(\d+)([smhd])$/i)
  if (!match) return 60 * 60 * 1000
  const n = parseInt(match[1], 10)
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()]
  return n * (unit || 3_600_000)
}

// Frontend (Vercel) and backend (Render) are on different registrable
// domains — a genuinely cross-site deployment, not just cross-subdomain.
// SameSite=strict/lax cookies are never sent back on cross-site requests,
// so this must be 'none' (requires Secure, already true in production) for
// the session cookie to round-trip at all. Restoring 'strict' requires
// putting frontend and backend back on the same registrable domain.
function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: parseJwtExpiresInToMs(process.env.JWT_EXPIRES_IN),
  }
}

function setSessionCookie(res, token) {
  if (!token) return
  res.cookie(getSessionCookieName(), token, sessionCookieOptions())
}

function clearSessionCookie(res) {
  const opts = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
  const name = getSessionCookieName()
  res.clearCookie(name, opts)
  if (name !== LEGACY_DEV_COOKIE) {
    res.clearCookie(LEGACY_DEV_COOKIE, opts)
  }
}

function readSessionCookieToken(req) {
  const primary = getSessionCookieName()
  const token = req.cookies?.[primary] || req.cookies?.[LEGACY_DEV_COOKIE]
  return typeof token === 'string' && token.length > 0 ? token : null
}

module.exports = {
  getSessionCookieName,
  setSessionCookie,
  clearSessionCookie,
  readSessionCookieToken,
  sessionCookieOptions,
  LEGACY_DEV_COOKIE,
  PROD_COOKIE,
  parseJwtExpiresInToMs,
}
