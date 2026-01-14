'use server'

import { AuthService } from '@/server/services/AuthService'
import { CreateUserInput, LoginInput } from '@/domain/entities/User'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function register(input: CreateUserInput) {
  try {
    const authService = new AuthService()
    const result = await authService.register(input)

    if (result.success && result.user) {
      const token = await new SignJWT({
        userId: result.user._id,
        email: result.user.email,
        username: result.user.username,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(SECRET_KEY)

      // Salvar token no cookie
      const cookieStore = await cookies()
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })

      // Adicionar username ou email ao resultado para redirect
      return {
        ...result,
        redirectTo: `/user/${result.user.username || result.user.email.split('@')[0]}`,
      }
    }

    return result
  } catch (error) {
    console.error('Erro no registro:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao registrar',
    }
  }
}

export async function login(input: LoginInput) {
  try {
    const authService = new AuthService()
    const result = await authService.login(input)

    if (result.success && result.user) {
      const token = await new SignJWT({
        userId: result.user._id,
        email: result.user.email,
        username: result.user.username,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(SECRET_KEY)

      // Salvar token no cookie
      const cookieStore = await cookies()
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })

      // Adicionar username ou email ao resultado para redirect
      return {
        ...result,
        redirectTo: `/user/${result.user.username || result.user.email.split('@')[0]}`,
      }
    }

    return result
  } catch (error) {
    console.error('Erro no login:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer login',
    }
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    return { success: true }
  } catch (error) {
    console.error('Erro no logout:', error)
    return {
      success: false,
      error: 'Erro ao fazer logout',
    }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return { success: false, user: null }
    }

    const verified = await jwtVerify(token.value, SECRET_KEY)
    const { email } = verified.payload as { userId: string; email: string }

    const { UserRepository } = await import('@/server/repositories/UserRepository')
    const userRepo = new UserRepository()
    const user = await userRepo.findByEmail(email)

    if (!user) {
      return { success: false, user: null }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user

    return { success: true, user: safeUser }
  } catch {
    return { success: false, user: null }
  }
}
