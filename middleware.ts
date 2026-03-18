import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'

async function getExpectedToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`prompticle:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API routes through
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const authPassword = process.env.AUTH_PASSWORD || 'Blurr2026!'
  const expectedToken = await getExpectedToken(authPassword)

  if (!token || token !== expectedToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
