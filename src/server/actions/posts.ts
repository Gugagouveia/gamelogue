'use server'

import { PostService } from '@/server/services/PostService'
import { PaginationParams } from '@/domain/value-objects/Pagination'
import { DEFAULT_PAGINATION } from '@/constants/config'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/actions/auth'

export async function getPosts(params?: Partial<PaginationParams>) {
  try {
    const { success: hasUser, user } = await getCurrentUser()
    const postService = new PostService()
    const page = params?.page || DEFAULT_PAGINATION.PAGE
    const limit = params?.limit || DEFAULT_PAGINATION.LIMIT

    if (!hasUser || !user?.username) {
      return {
        success: true,
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      }
    }

    const result = await postService.getPosts({ page, limit }, { username: user.username })

    return {
      success: true,
      ...result,
    }
  } catch (error) {
    console.error('Erro ao listar posts:', error)
    return {
      success: false,
      posts: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
      error: error instanceof Error ? error.message : 'Erro ao listar posts',
    }
  }
}

export async function getPublicPosts(params?: Partial<PaginationParams>) {
  try {
    const postService = new PostService()
    const page = params?.page || DEFAULT_PAGINATION.PAGE
    const limit = params?.limit || DEFAULT_PAGINATION.LIMIT

    const result = await postService.getPublicPosts({ page, limit })

    return { success: true, ...result }
  } catch (error) {
    console.error('Erro ao listar posts públicos:', error)
    return {
      success: false,
      posts: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      error: error instanceof Error ? error.message : 'Erro ao listar posts públicos',
    }
  }
}

export async function deletePost(postId: string) {
  try {
    const postService = new PostService()
    const result = await postService.deletePost(postId)

    if (result.success) {
      revalidatePath('/')
    }

    return result
  } catch (error) {
    console.error('Erro ao deletar post:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao deletar post',
    }
  }
}

export async function toggleLike(postId: string) {
  try {
    const { success: hasUser, user } = await getCurrentUser()

    if (!hasUser || !user?.id) {
      return {
        success: false,
        message: 'Usuário não autenticado',
      }
    }

    const postService = new PostService()
    const result = await postService.toggleLike(postId, user.id)

    if (result.success) {
      revalidatePath('/')
    }

    return result
  } catch (error) {
    console.error('Erro ao dar like:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao dar like',
    }
  }
}

export async function addComment(postId: string, text: string) {
  try {
    const { success: hasUser, user } = await getCurrentUser()

    if (!hasUser || !user?._id) {
      return {
        success: false,
        message: 'Usuário não autenticado',
      }
    }

    const postService = new PostService()
    const result = await postService.addComment(postId, user._id, text)

    if (result.success) {
      revalidatePath('/')
    }

    return result
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao adicionar comentário',
    }
  }
}

export async function deleteComment(postId: string, commentCreatedAt: string) {
  try {
    const { success: hasUser } = await getCurrentUser()

    if (!hasUser) {
      return {
        success: false,
        message: 'Usuário não autenticado',
      }
    }

    const postService = new PostService()
    const result = await postService.deleteComment(postId, commentCreatedAt)

    if (result.success) {
      revalidatePath('/')
    }

    return result
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao deletar comentário',
    }
  }
}

export async function updatePostVisibility(postId: string, isPublic: boolean) {
  try {
    const { success: hasUser, user } = await getCurrentUser()

    if (!hasUser || !user?.username) {
      return {
        success: false,
        message: 'Usuário não autenticado',
      }
    }

    const postService = new PostService()
    const result = await postService.updatePostVisibility(postId, isPublic, user.username)

    if (result.success) {
      revalidatePath('/')
    }

    return result
  } catch (error) {
    console.error('Erro ao atualizar visibilidade do post:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar visibilidade do post',
    }
  }
}
