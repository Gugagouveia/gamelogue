import { CreatePostInput, Post, PostWithUser } from '@/domain/entities/Post'
import { PostRepository } from '@/server/repositories/PostRepository'
import { PaginationParams, PaginationResult } from '@/domain/value-objects/Pagination'
import { getDb } from '@/lib/db/mongo'
import { ObjectId } from 'mongodb'

type DbPost = Omit<Post, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
}

export class PostService {
  private repository: PostRepository

  constructor() {
    this.repository = new PostRepository()
  }

  async getPosts(
    params: PaginationParams,
    options?: { username?: string }
  ): Promise<{
    posts: PostWithUser[]
    pagination: PaginationResult
  }> {
    const { posts, total } = await this.repository.findPaginated(params, options)

    const pages = Math.ceil(total / params.limit)

    return {
      posts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages,
      },
    }
  }

  async createPost(input: CreatePostInput) {
    return this.repository.create(input)
  }

  async deletePost(postId: string): Promise<{ success: boolean; message?: string }> {
    const post = await this.repository.findById(postId)

    if (!post) {
      return { success: false, message: 'Post não encontrado' }
    }

    if (post.publicId) {
      try {
        const cloudinary = (await import('@/lib/config/cloudinary')).default
        await cloudinary.uploader.destroy(post.publicId)
      } catch (error) {
        console.error('Erro ao deletar imagem do Cloudinary:', error)
      }
    }

    const deleted = await this.repository.delete(postId)

    if (deleted) {
      return { success: true, message: 'Post deletado com sucesso' }
    }

    return { success: false, message: 'Erro ao deletar post' }
  }

  async toggleLike(postId: string, userId: string): Promise<{ success: boolean; liked: boolean; message?: string }> {
    try {
      const db = await getDb('gamelogue')
      const posts = db.collection<DbPost>('Post')

      if (!ObjectId.isValid(postId)) return { success: false, liked: false, message: 'Post inválido' }

      const post = await posts.findOne({ _id: new ObjectId(postId) })
      if (!post) return { success: false, liked: false, message: 'Post não encontrado' }

      const alreadyLiked = Array.isArray(post.likes) ? post.likes.includes(userId) : false

      if (alreadyLiked) {
        await posts.updateOne({ _id: new ObjectId(postId) }, { $pull: { likes: { $in: [userId] } } })
        return { success: true, liked: false }
      } else {
        await posts.updateOne({ _id: new ObjectId(postId) }, { $addToSet: { likes: userId } })
        return { success: true, liked: true }
      }
    } catch (error) {
      console.error('Erro ao dar like:', error)
      return { success: false, liked: false, message: 'Erro ao dar like' }
    }
  }

  async addComment(postId: string, userId: string, text: string): Promise<{ success: boolean; message?: string }> {
    try {
      const db = await getDb('gamelogue')
      const posts = db.collection<DbPost>('Post')

      if (!ObjectId.isValid(postId)) return { success: false, message: 'Post inválido' }

      const result = await posts.updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: {
            comments: {
              userId,
              text,
              createdAt: new Date(),
            },
          },
        }
      )

      if (result.modifiedCount > 0) return { success: true }
      return { success: false, message: 'Erro ao adicionar comentário' }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      return { success: false, message: 'Erro ao adicionar comentário' }
    }
  }

  async deleteComment(_commentId: string): Promise<{ success: boolean; message?: string }> {
    void _commentId
    // Not implemented for embedded comments in this iteration
    return { success: false, message: 'Remoção de comentário não disponível' }
  }

  async getPublicPosts(
    params: PaginationParams,
    excludeUsername?: string
  ): Promise<{ posts: PostWithUser[]; pagination: PaginationResult }> {
    const { posts, total } = await this.repository.findPaginated(params, {
      publicOnly: true,
      excludeUsername,
    })

    const pages = Math.ceil(total / params.limit)
    return {
      posts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages,
      },
    }
  }

  async updatePostVisibility(
    postId: string,
    isPublic: boolean,
    username: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const db = await getDb('gamelogue')
      const posts = db.collection<DbPost>('Post')

      if (!ObjectId.isValid(postId)) {
        return { success: false, message: 'Post inválido' }
      }

      const post = await posts.findOne({ _id: new ObjectId(postId) })
      if (!post) {
        return { success: false, message: 'Post não encontrado' }
      }

      // Verify ownership
      if (post.userId !== username) {
        return { success: false, message: 'Você não tem permissão para alterar este post' }
      }

      const result = await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { isPublic } }
      )

      if (result.modifiedCount > 0) {
        return { success: true, message: 'Visibilidade do post atualizada' }
      }

      return { success: false, message: 'Erro ao atualizar visibilidade' }
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error)
      return { success: false, message: 'Erro ao atualizar visibilidade do post' }
    }
  }
}
