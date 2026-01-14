'use server'

import { UploadService } from '@/server/services/UploadService'
import { PostService } from '@/server/services/PostService'
import { deleteUploadedFile } from '@/server/actions/cleanup'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/actions/auth'

export async function uploadPost(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const game = formData.get('game') as string
    const tags = formData.get('tags') as string
    const isPublic = (formData.get('isPublic') as string) === 'true'

    if (!file) {
      return {
        success: false,
        error: 'Arquivo não fornecido',
      }
    }

    const { success: hasUser, user } = await getCurrentUser()
    if (!hasUser || !user?.username) {
      return {
        success: false,
        error: 'Você precisa estar logado para publicar',
      }
    }

    if (!title || !description) {
      return {
        success: false,
        error: 'title e description são obrigatórios',
      }
    }

    const uploadService = new UploadService()
    const { imageUrl, publicId, filename } = await uploadService.uploadImage(file)

    const postService = new PostService()
    const post = await postService.createPost({
      userId: user.username,
      imageUrl,
      publicId,
      title,
      description,
      game,
      isPublic,
      tags: tags
        ? tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
    })

    if (!post) {
      return {
        success: false,
        error: 'Erro ao criar post no banco de dados',
      }
    }

    // Delete local file ONLY if the image was uploaded to Cloudinary (publicId exists)
    // If using local storage (publicId is null), keep the file because the URL points to it
    if (filename && publicId) {
      // Image is on Cloudinary, safe to delete local temp file
      const cleanupResult = await deleteUploadedFile(filename)
      if (cleanupResult.success) {
        console.log(`Temporary local file ${filename} deleted after Cloudinary upload`)
      } else {
        console.warn(`Failed to delete temp file ${filename}:`, cleanupResult.message)
      }
    }

    revalidatePath('/')

    return {
      success: true,
      post,
      message: 'Post criado com sucesso!',
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload da imagem',
    }
  }
}
