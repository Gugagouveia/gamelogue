import { getDb } from '@/lib/db/mongo'
import { CreatePostInput, Post, PostWithUser } from '@/domain/entities/Post'
import { PaginationParams } from '@/domain/value-objects/Pagination'
import type { Filter } from 'mongodb'
import { ObjectId } from 'mongodb'

export class PostRepository {
  private async getCollection() {
    const db = await getDb('gamelogue')
    return db.collection<Post>('Post')
  }

  async findPaginated(
    params: PaginationParams,
    options?: { username?: string; publicOnly?: boolean; excludeUsername?: string }
  ): Promise<{ posts: PostWithUser[]; total: number }> {
    const db = await getDb('gamelogue')
    const posts = db.collection('Post')

    const { page, limit } = params
    const skip = (page - 1) * limit

    const match: Record<string, unknown> = {}
    if (options?.username) match.userId = options.username
    if (options?.publicOnly) match.isPublic = true
    if (options?.excludeUsername) {
      match.userId = { ...(match.userId ? { $eq: match.userId } : {}), $ne: options.excludeUsername }
    }

    const [result] = await posts
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            posts: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: 'User',
                  localField: 'userId',
                  foreignField: 'username',
                  as: 'userArray',
                },
              },
              {
                $addFields: {
                  user: { $arrayElemAt: ['$userArray', 0] },
                  likesCount: { $size: { $ifNull: ['$likes', []] } },
                  commentsCount: { $size: { $ifNull: ['$comments', []] } },
                },
              },
              {
                $project: {
                  userArray: 0,
                },
              },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .toArray()

    const total = result?.total?.[0]?.count || 0
    const postsData = (result?.posts || []).map(
      (post: {
        _id: unknown
        user?: {
          _id?: unknown
          username?: string
          email?: string
          createdAt?: Date | string
          updatedAt?: Date | string
        }
        createdAt?: Date | string
        updatedAt?: Date | string
        [key: string]: unknown
      }) => ({
        ...post,
        _id: post._id?.toString(),
        createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
        updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
        user: post.user
          ? {
              _id: post.user._id?.toString(),
              createdAt:
                post.user.createdAt instanceof Date
                  ? post.user.createdAt.toISOString()
                  : post.user.createdAt,
              updatedAt:
                post.user.updatedAt instanceof Date
                  ? post.user.updatedAt.toISOString()
                  : post.user.updatedAt,
              username: post.user.username,
              email: post.user.email,
            }
          : null,
      })
    )

    return {
      posts: postsData as PostWithUser[],
      total,
    }
  }

  async create(input: CreatePostInput): Promise<Post> {
    const posts = await this.getCollection()
    const now = new Date()

    const doc = {
      ...input,
      tags: input.tags || [],
      game: input.game || '',
      isPublic: Boolean(input.isPublic) || false,
      likes: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await posts.insertOne(doc as any)

    return {
      _id: result.insertedId.toString(),
      ...doc,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } as unknown as Post
  }

  async findById(id: string): Promise<Post | null> {
    const posts = await this.getCollection()

    if (!ObjectId.isValid(id)) {
      return null
    }

    const post = await posts.findOne({ _id: new ObjectId(id) } as unknown as Filter<Post>)

    if (!post) return null

    return {
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
      updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
    } as unknown as Post
  }

  async delete(id: string): Promise<boolean> {
    const posts = await this.getCollection()

    if (!ObjectId.isValid(id)) {
      return false
    }

    const result = await posts.deleteOne({ _id: new ObjectId(id) } as unknown as Filter<Post>)
    return result.deletedCount > 0
  }
}
