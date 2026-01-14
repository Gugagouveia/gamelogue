export interface User {
  _id: string
  id: string
  email: string
  passwordHash: string
  username?: string
  bio?: string
  avatar?: string
  emailVerified: boolean
  lastLoginAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateUserInput {
  email: string
  password: string
  username?: string
  bio?: string
  avatar?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface SafeUser {
  _id: string
  id: string
  email: string
  username?: string
  bio?: string
  avatar?: string
  emailVerified: boolean
  lastLoginAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}
