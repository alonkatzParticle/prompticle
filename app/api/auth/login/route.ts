import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`prompticle:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  const authPassword = process.env.AUTH_PASSWORD || 'Blurr2026!'

  if (!password || password !== authPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await hashPassword(authPassword)

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Set secure: true when serving over HTTPS (e.g. behind a reverse proxy)
    secure: false,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  })

  return response
}
