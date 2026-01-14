import { getDb } from '@/lib/db/mongo'
import { CreateUserInput, User, SafeUser } from '@/domain/entities/User'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

export class UserRepository {
  private async getCollection() {
    const db = await getDb('gamelogue')
    return db.collection<User>('User')
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.getCollection()
    const user = await users.findOne({ email } as any)
    if (!user) return null
    return {
      ...user,
      _id: user._id.toString(),
      id: user.id || '1',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    } as any
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = await this.getCollection()
    const user = await users.findOne({ username } as any)
    if (!user) return null
    return {
      ...user,
      _id: user._id.toString(),
      id: user.id || '1',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    } as any
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const users = await this.getCollection()
    const user = await users.findOne({ $or: [{ email }, { username }] } as any)
    if (!user) return null
    return {
      ...user,
      _id: user._id.toString(),
      id: user.id || '1',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    } as any
  }

  async findById(userId: string): Promise<User | null> {
    const users = await this.getCollection()
    const user = await users.findOne({ _id: new ObjectId(userId) } as any)
    if (!user) return null
    return {
      ...user,
      _id: user._id.toString(),
      id: user.id || '1',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    } as any
  }

  async create(input: CreateUserInput): Promise<SafeUser> {
    const users = await this.getCollection()
    const now = new Date()

    const lastUser = await users.findOne({}, { sort: { id: -1 } })
    const nextId = lastUser?.id ? String(Number(lastUser.id) + 1) : '1'

    const passwordHash = await bcrypt.hash(input.password, 12)

    const doc = {
      id: nextId,
      email: input.email,
      passwordHash,
      username: input.username || null,
      bio: input.bio || null,
      avatar: input.avatar || null,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    }

    const result = await users.insertOne(doc as any)

    return {
      _id: result.insertedId.toString(),
      id: nextId,
      email: doc.email,
      username: doc.username || undefined,
      bio: doc.bio || undefined,
      avatar: doc.avatar || undefined,
      emailVerified: doc.emailVerified,
      lastLoginAt: doc.lastLoginAt || undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    const users = await this.getCollection()
    await users.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } })
  }

  async verifyEmail(userId: string): Promise<void> {
    const users = await this.getCollection()
    await users.updateOne({ _id: userId }, { $set: { emailVerified: true } })
  }

  async update(
    userId: string,
    updates: {
      username?: string
      bio?: string
      avatar?: string
    }
  ): Promise<User | null> {
    const users = await this.getCollection()

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (updates.username !== undefined) updateData.username = updates.username
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar

    const result = await users.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) return null

    return {
      ...result,
      _id: result._id.toString(),
      id: result.id || '1',
      createdAt:
        result.createdAt instanceof Date ? result.createdAt.toISOString() : result.createdAt,
      updatedAt:
        result.updatedAt instanceof Date ? result.updatedAt.toISOString() : result.updatedAt,
    } as any
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    const users = await this.getCollection()
    const objectIds = userIds.map(id => new ObjectId(id))
    const results = await users.find({ _id: { $in: objectIds } } as any).toArray()
    
    return results.map(user => ({
      ...user,
      _id: user._id.toString(),
      id: user.id || '1',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    } as any))
  }
}
