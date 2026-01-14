import cloudinary from '@/lib/config/cloudinary'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export interface UploadResult {
  imageUrl: string
  publicId: string | null
  filename?: string
}

export class UploadService {
  async uploadImage(file: File): Promise<UploadResult> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const useLocalFallback = process.env.USE_LOCAL_UPLOAD === 'true'
    const hasCloudinaryCreds = Boolean(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!useLocalFallback && hasCloudinaryCreds) {
      try {
        const uploadResponse = await new Promise<{ secure_url: string; public_id: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: 'gamelogue',
                  resource_type: 'auto',
                },
                (error, result) => {
                  if (error) reject(error)
                  else if (result) resolve(result)
                  else reject(new Error('Upload failed'))
                }
              )
              .end(buffer)
          }
        )

        return {
          imageUrl: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
        }
      } catch (err: unknown) {
        if (process.env.NODE_ENV === 'development') {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          console.warn('Cloudinary falhou, usando fallback local:', errorMessage)
        }
      }
    }

    return this.uploadLocal(file, buffer)
  }

  private async uploadLocal(file: File, buffer: Buffer): Promise<UploadResult> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const ext = (file.type?.split('/')[1] || 'jpg').replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    await fs.writeFile(filepath, buffer)

    return {
      imageUrl: `/uploads/${filename}`,
      publicId: null,
      filename,
    }
  }
}
