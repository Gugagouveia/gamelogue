import { CreateUserInput, User } from '@/domain/entities/User'
import { UserRepository } from '@/server/repositories/UserRepository'

export class UserService {
  private repository: UserRepository

  constructor() {
    this.repository = new UserRepository()
  }

  async createUser(input: CreateUserInput): Promise<any> {
    const existing = await this.repository.findByEmailOrUsername(input.email, input.username || '')

    if (existing) {
      throw new Error('Email ou username já está em uso')
    }

    return this.repository.create(input)
  }

  async getUserByUsername(username: string): Promise<any> {
    return this.repository.findByUsername(username)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email)
  }
}
