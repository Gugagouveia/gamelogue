'use server'

import { promises as fs } from 'fs'
import path from 'path'

export async function deleteUploadedFile(filename: string): Promise<{ success: boolean; message?: string }> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadsDir, filename)

    // Ensure the path is within the uploads directory (security)
    if (!filePath.startsWith(uploadsDir)) {
      return { success: false, message: 'Caminho inválido' }
    }

    await fs.unlink(filePath)
    return { success: true, message: 'Arquivo deletado com sucesso' }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return { success: false, message: 'Erro ao deletar arquivo' }
  }
}
