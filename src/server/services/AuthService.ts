import { UserRepository } from '@/server/repositories/UserRepository'
import { CreateUserInput, LoginInput, SafeUser } from '@/domain/entities/User'
import bcrypt from 'bcrypt'

export class AuthService {
  private repository: UserRepository

  constructor() {
    this.repository = new UserRepository()
  }

  async register(
    input: CreateUserInput
  ): Promise<{ success: boolean; user?: SafeUser; error?: string }> {
    try {
      if (!this.isValidEmail(input.email)) {
        return { success: false, error: 'Email inválido' }
      }

      if (!input.password || input.password.length < 6) {
        return { success: false, error: 'Senha deve ter no mínimo 6 caracteres' }
      }

      if (!input.username || input.username.trim().length < 3) {
        return { success: false, error: 'Username deve ter no mínimo 3 caracteres' }
      }

      const existingUser = await this.repository.findByEmail(input.email)
      if (existingUser) {
        return { success: false, error: 'Email já está em uso' }
      }

      const existingUsername = await this.repository.findByUsername(input.username)
      if (existingUsername) {
        return { success: false, error: 'Username já está em uso' }
      }

      const user = await this.repository.create(input)

      return { success: true, user }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error: 'Erro ao criar usuário' }
    }
  }

  async login(input: LoginInput): Promise<{ success: boolean; user?: SafeUser; error?: string }> {
    try {
      const user = await this.repository.findByEmail(input.email)

      if (!user) {
        return { success: false, error: 'Email ou senha inválidos' }
      }

      const isValid = await bcrypt.compare(input.password, user.passwordHash)

      if (!isValid) {
        return { success: false, error: 'Email ou senha inválidos' }
      }

      await this.repository.updateLastLogin(user._id)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _passwordHash, ...safeUser } = user

      return { success: true, user: safeUser as SafeUser }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
