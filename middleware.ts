import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  console.log('[Middleware]', pathname, 'Token:', token ? 'exists' : 'none')

  const isAuthRoute = pathname.startsWith('/auth')

  if (pathname === '/') {
    if (!token) {
      console.log('[Middleware] Raiz sem token -> redirect /auth')
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    try {
      const { payload } = await jwtVerify(token.value, SECRET_KEY)
      const username = (payload.username as string) || (payload.email as string)?.split('@')[0]
      console.log('[Middleware] Raiz com token -> redirect para /user/' + username)
      return NextResponse.redirect(new URL(`/user/${username}`, request.url))
    } catch {
      console.log('[Middleware] Token inválido na raiz -> redirect /auth')
      const response = NextResponse.redirect(new URL('/auth', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token.value, SECRET_KEY)
      const username = (payload.username as string) || (payload.email as string)?.split('@')[0]
      console.log('[Middleware] Autenticado acessando /auth -> redirect para /user/' + username)
      return NextResponse.redirect(new URL(`/user/${username}`, request.url))
    } catch {
      console.log('[Middleware] Token inválido em /auth -> permite acesso')
      return NextResponse.next()
    }
  }

  if (isAuthRoute && !token) {
    console.log('[Middleware] Acessando /auth sem token -> permite')
    return NextResponse.next()
  }

  if (!token) {
    console.log('[Middleware] Sem token em rota protegida -> redirect para /auth')
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  try {
    await jwtVerify(token.value, SECRET_KEY)
    console.log('[Middleware] Token válido -> permite acesso')
    return NextResponse.next()
  } catch {
    console.log('[Middleware] Token inválido -> redirect para /auth')
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/',
    '/auth',
    '/user/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
