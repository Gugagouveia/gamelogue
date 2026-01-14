'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { uploadPost } from '@/server/actions/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface UploadFormProps {
  onSuccess?: () => void
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [game, setGame] = useState('')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  })

  const clearPreview = () => {
    setPreview(null)
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Título e descrição são obrigatórios')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('game', game)
      formData.append('tags', tags)
      formData.append('isPublic', String(isPublic))

      // Simular progresso do upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 30
        })
      }, 300)

      const result = await uploadPost(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        toast.success('Post publicado com sucesso!')
        setPreview(null)
        setTitle('')
        setDescription('')
        setGame('')
        setTags('')
        setSelectedFile(null)
        setUploadProgress(0)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Erro ao fazer upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Novo Post</CardTitle>
        <CardDescription>
          Compartilhe suas melhores capturas de tela com a comunidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {uploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Enviando: {Math.round(uploadProgress)}%</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Dropzone */}
          <div className="space-y-2">
            <Label>Imagem</Label>
            {preview ? (
              <div className="relative rounded-lg overflow-hidden border">
                <Image src={preview} alt="Preview" width={400} height={256} className="w-full h-64 object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  {isDragActive ? (
                    <Upload className="h-12 w-12 text-primary animate-bounce" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {isDragActive
                        ? 'Solte a imagem aqui...'
                        : 'Arraste uma imagem ou clique para selecionar'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF até 10MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Dê um título ao seu post"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva sua captura épica..."
              rows={4}
              required
            />
          </div>

          {/* Game */}
          <div className="space-y-2">
            <Label htmlFor="game">Jogo</Label>
            <Input
              id="game"
              type="text"
              value={game}
              onChange={e => setGame(e.target.value)}
              placeholder="Ex: Elden Ring, CS2, Valorant..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Ex: fps, rpg, clutch (separados por vírgula)"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <Label htmlFor="isPublic">Tornar público (visível para outros usuários)</Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={uploading || !selectedFile}>
            {uploading ? (
              'Enviando...'
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publicar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
