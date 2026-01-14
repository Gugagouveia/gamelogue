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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Upload, Image as ImageIcon, Sparkles, Globe, Lock, Gamepad2, Tags, Info, Trash2 } from 'lucide-react'
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

  const popularGames = [
    'Selecione um jogo...',
    'Elden Ring',
    'Counter-Strike 2',
    'Valorant',
    'League of Legends',
    'Minecraft',
    'GTA V',
    'Red Dead Redemption 2',
    'The Witcher 3',
    'Cyberpunk 2077',
    'Baldur\'s Gate 3',
    'Outros'
  ]

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto border-none shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-1 pb-3 sm:pb-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-2xl">Novo Post</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Compartilhe suas melhores capturas de tela com a comunidade
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mb-4 sm:mb-6" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {uploading && (
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse flex-shrink-0" />
                      <span className="truncate">Enviando seu momento épico...</span>
                    </p>
                    <span className="text-xs sm:text-sm font-bold text-primary flex-shrink-0">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                    <ImageIcon className="h-4 w-4 flex-shrink-0" />
                    Imagem
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Envie sua melhor captura de tela. Formatos: PNG, JPG, GIF.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {preview ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-muted group cursor-pointer">
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    width={400} 
                    height={256} 
                    className="w-full h-48 sm:h-64 object-cover" 
                  />
                  <div 
                    className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300 flex items-center justify-center group"
                    onClick={clearPreview}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                      <Trash2 className="h-12 w-12 text-white drop-shadow-lg" />
                      <p className="text-white font-semibold text-sm drop-shadow-lg">Remover imagem</p>
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 left-2 bg-black/60 text-white hover:bg-black/70">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Preview
                  </Badge>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    {isDragActive ? (
                      <Upload className="h-12 sm:h-16 w-12 sm:w-16 text-primary animate-bounce" />
                    ) : (
                      <ImageIcon className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground" />
                    )}
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-semibold px-2">
                        {isDragActive
                          ? '✨ Solte a imagem aqui...'
                          : 'Arraste uma imagem ou clique para selecionar'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">PNG, JPG, GIF, WEBP até 10MB</p>
                      <div className="mt-1.5 sm:mt-2 flex gap-1 sm:gap-2 justify-center flex-wrap">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs py-0.5">4K Support</Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs py-0.5">HDR Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

              <Separator className="my-3 sm:my-4" />

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                Título *
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Dê um título épico ao seu post..."
                className="text-sm sm:text-base h-10 sm:h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base font-semibold">Descrição *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Conte a história por trás desse momento incrível... ✨"
                rows={3}
                className="resize-none text-sm sm:text-base"
                required
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 flex-shrink-0" />
                Jogo
              </Label>
              <Select 
                value={game && popularGames.includes(game) ? game : 'Outros'} 
                onValueChange={(value) => {
                  if (value === 'Outros') {
                    setGame('')
                  } else {
                    setGame(value)
                  }
                }}
              >
                <SelectTrigger className="h-10 sm:h-12 text-sm">
                  <SelectValue placeholder="Selecione um jogo..." />
                </SelectTrigger>
                <SelectContent>
                  {popularGames.map((g, i) => (
                    <SelectItem 
                      key={i} 
                      value={g} 
                      disabled={i === 0}
                      className="text-sm"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!game || !popularGames.slice(1).includes(game)) && (
                <Input
                  type="text"
                  placeholder="Digite o nome do jogo..."
                  value={game}
                  onChange={e => setGame(e.target.value)}
                  className="mt-2 h-10 sm:h-12 text-sm"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Tags className="h-4 w-4 flex-shrink-0" />
                Tags
              </Label>
              <Input
                id="tags"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="fps, rpg, clutch, pvp, boss-fight..."
                className="h-10 sm:h-12 text-sm"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                {tags.split(',').filter(t => t.trim()).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs py-0.5">
                    #{tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <Label htmlFor="isPublic" className="text-sm sm:text-base font-semibold cursor-pointer">
                    {isPublic ? 'Post Público' : 'Post Privado'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublic 
                      ? 'Visível para toda a comunidade' 
                      : 'Apenas você pode ver este post'}
                  </p>
                </div>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
              disabled={uploading || !selectedFile}
              size="lg"
            >
              {uploading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="sm:hidden">Enviando</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Publicar Post</span>
                  <span className="sm:hidden">Publicar</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
