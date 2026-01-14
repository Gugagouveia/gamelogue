'use server'

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { ObjectId } from 'mongodb'
import { UserService } from '@/server/services/UserService'
import { UserRepository } from '@/server/repositories/UserRepository'
import { CreateUserInput, SafeUser } from '@/domain/entities/User'

export async function createUser(input: CreateUserInput) {
  try {
    const userService = new UserService()
    const user = await userService.createUser(input)

    return {
      success: true,
      user,
      message: 'Usuário criado com sucesso!',
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar usuário',
    }
  }
}

export async function getUserByUsername(username: string) {
  try {
    const userService = new UserService()
    const user = await userService.getUserByUsername(username)

    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
    }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const userService = new UserService()
    const user = await userService.getUserByEmail(email)

    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
    }
  }
}

export async function updateUserProfile(updates: {
  username?: string
  bio?: string
  avatar?: string
}): Promise<{ success: boolean; user?: SafeUser; error?: string }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { success: false, error: 'Não autorizado' }
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key')
    const verified = await jwtVerify(token, secret)
    const userId = verified.payload.userId as string

    if (!userId || !ObjectId.isValid(userId)) {
      return { success: false, error: 'Token inválido' }
    }

    if (updates.username && updates.username.length < 3) {
      return { success: false, error: 'Username deve ter pelo menos 3 caracteres' }
    }

    if (updates.username && updates.username.length > 30) {
      return { success: false, error: 'Username deve ter no máximo 30 caracteres' }
    }

    if (updates.bio && updates.bio.length > 500) {
      return { success: false, error: 'Bio deve ter no máximo 500 caracteres' }
    }

    const userRepo = new UserRepository()
    const user = await userRepo.update(userId, updates)

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    const safeUser: SafeUser = {
      _id: user._id,
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return { success: true, user: safeUser }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return { success: false, error: 'Erro ao atualizar usuário' }
  }
}
