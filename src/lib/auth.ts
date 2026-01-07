import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { type JWTPayload, type UserSession, type Client } from '@/types'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'franca_session'

// Gera token JWT
export async function generateToken(client: Client, isAdmin: boolean = false): Promise<string> {
  const token = await new SignJWT({
    sub: client.id,
    phone: client.phone,
    name: client.name,
    company_name: client.company_name,
    is_admin: isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

// Verifica e decodifica token JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Salva sessão no cookie
export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
}

// Obtém sessão do cookie
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return {
    client_id: payload.sub,
    phone: payload.phone,
    name: payload.name,
    company_name: payload.company_name,
    is_admin: payload.is_admin,
    exp: payload.exp,
  }
}

// Remove sessão (logout)
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Verifica se usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

// Verifica se usuário é admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.is_admin ?? false
}

// Obtém ID do cliente da sessão
export async function getClientId(): Promise<string | null> {
  const session = await getSession()
  return session?.client_id ?? null
}
