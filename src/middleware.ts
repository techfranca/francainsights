import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

// CORREÇÃO: Removido '/' das rotas públicas
// A rota raiz agora redireciona internamente, então precisa de autenticação
const publicRoutes = ['/login', '/verify', '/api/auth/request-code', '/api/auth/verify-code', '/api/health']

// Rotas exclusivas de admin
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  // Permite arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.') // arquivos com extensão
  ) {
    return NextResponse.next()
  }

  // Verifica token de autenticação
  const token = request.cookies.get('franca_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Verifica rotas de admin
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!payload.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Token inválido ou expirado
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('franca_session')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
}
