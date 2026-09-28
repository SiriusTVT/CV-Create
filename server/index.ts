import 'dotenv/config'
import express from 'express'
import { randomBytes } from 'node:crypto'

const app = express()
const port = Number(process.env.PORT ?? 3000)
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
const authorizationUrl = 'https://www.linkedin.com/oauth/v2/authorization'
const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken'
const userInfoUrl = 'https://api.linkedin.com/v2/userinfo'

type LinkedInData = { firstName?: string; lastName?: string; headline?: string; email?: string; summary?: string }
const states = new Map<string, number>()
const imports = new Map<string, { data: LinkedInData; expiresAt: number }>()

function cleanExpired() {
  const now = Date.now()
  for (const [key, expiresAt] of states) if (expiresAt < now) states.delete(key)
  for (const [key, value] of imports) if (value.expiresAt < now) imports.delete(key)
}

app.get('/auth/linkedin', (_request, response) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? `${clientUrl}/auth/linkedin/callback`
  if (!clientId) return response.status(503).send('LinkedIn OAuth no está configurado. Define LINKEDIN_CLIENT_ID y LINKEDIN_CLIENT_SECRET.')
  const state = randomBytes(24).toString('hex')
  states.set(state, Date.now() + 10 * 60 * 1000)
  const params = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, state, scope: 'openid profile email' })
  response.redirect(`${authorizationUrl}?${params.toString()}`)
})

app.get('/auth/linkedin/callback', async (request, response) => {
  cleanExpired()
  const { code, state, error } = request.query as { code?: string; state?: string; error?: string }
  if (error || !code || !state || !states.has(state)) return response.redirect(`${clientUrl}/?linkedinError=oauth_failed`)
  states.delete(state)
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? `${clientUrl}/auth/linkedin/callback`
    if (!clientId || !clientSecret) throw new Error('LinkedIn OAuth credentials are missing')
    const tokenResponse = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }) })
    if (!tokenResponse.ok) throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    const token = await tokenResponse.json() as { access_token?: string }
    if (!token.access_token) throw new Error('LinkedIn did not return an access token')
    const profileResponse = await fetch(userInfoUrl, { headers: { Authorization: `Bearer ${token.access_token}` } })
    if (!profileResponse.ok) throw new Error(`Profile request failed: ${profileResponse.status}`)
    const profile = await profileResponse.json() as { given_name?: string; family_name?: string; email?: string; name?: string }
    const importId = randomBytes(24).toString('hex')
    imports.set(importId, { data: { firstName: profile.given_name, lastName: profile.family_name, email: profile.email }, expiresAt: Date.now() + 10 * 60 * 1000 })
    response.redirect(`${clientUrl}/?linkedinImport=${importId}`)
  } catch (error) {
    console.error('LinkedIn OAuth error:', error)
    response.redirect(`${clientUrl}/?linkedinError=profile_failed`)
  }
})

app.get('/api/linkedin/import/:id', (request, response) => {
  cleanExpired()
  const imported = imports.get(request.params.id)
  if (!imported) return response.status(404).json({ error: 'Import not found or expired' })
  imports.delete(request.params.id)
  response.json({ data: imported.data })
})

app.listen(port, () => console.log(`LinkedIn OAuth backend listening on http://localhost:${port}`))
