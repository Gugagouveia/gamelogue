'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Heart, MessageCircle, Send, Globe, Lock, Sparkles, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { toggleLike, addComment, updatePostVisibility, deleteComment } from '@/server/actions/posts'
import type { PostWithUser } from '@/domain/entities/Post'

interface PostModalProps {
  post: PostWithUser
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  isOwner?: boolean
  currentUserId?: string
}

export function PostModal({ post, isOpen, onClose, isAuthenticated, isOwner = false, currentUserId }: PostModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(post.likesCount)
  const [comments, setComments] = useState<Array<{ userId: string; username?: string; text: string; createdAt: string }>>([])
  const [commentText, setCommentText] = useState('')
  const [liking, setLiking] = useState(false)
  const [posting, setPosting] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isPublic, setIsPublic] = useState(post.isPublic || false)
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

  useEffect(() => {
    if (post.comments && Array.isArray(post.comments)) {
      const formattedComments = post.comments.map(comment => ({
        userId: comment.userId,
        username: comment.username,
        text: comment.text,
        createdAt: comment.createdAt instanceof Date 
          ? comment.createdAt.toISOString() 
          : String(comment.createdAt)
      }))
      setComments(formattedComments)
    } else {
      setComments([])
    }
  }, [post._id, post])

  const aspectRatio = imageDimensions ? imageDimensions.width / imageDimensions.height : 1
  const isPortrait = aspectRatio < 0.8
  const isLandscape = aspectRatio > 1.3

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar autenticado para dar like')
      return
    }

    setLiking(true)
    try {
      const result = await toggleLike(post._id)

      if (result.success && 'liked' in result) {
        if (result.liked) {
          setLikes(prev => prev + 1)
          setIsLiked(true)
          toast.success('Post curtido!')
        } else {
          setLikes(prev => Math.max(0, prev - 1))
          setIsLiked(false)
          toast.success('Like removido')
        }
      } else {
        toast.error(result.message || 'Erro ao dar like')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao dar like')
    } finally {
      setLiking(false)
    }
  }

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar autenticado para comentar')
      return
    }

    if (!commentText.trim()) {
      toast.error('Digite um comentário')
      return
    }

    setPosting(true)
    try {
      const result = await addComment(post._id, commentText)

      if (result.success) {
        setComments(prev => [
          ...prev,
          {
            userId: '',
            text: commentText,
            createdAt: new Date().toISOString(),
          },
        ])
        setCommentText('')
        toast.success('Comentário adicionado!')
      } else {
        toast.error(result.message || 'Erro ao adicionar comentário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao adicionar comentário')
    } finally {
      setPosting(false)
    }
  }

  const handleToggleVisibility = async () => {
    if (!isOwner) {
      toast.error('Você não pode alterar a visibilidade deste post')
      return
    }

    setUpdatingVisibility(true)
    try {
      const result = await updatePostVisibility(post._id, !isPublic)

      if (result.success) {
        setIsPublic(!isPublic)
        toast.success(
          !isPublic
            ? 'Post marcado como público ✨'
            : 'Post marcado como privado 🔒'
        )
      } else {
        toast.error(result.message || 'Erro ao atualizar visibilidade')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar visibilidade')
    } finally {
      setUpdatingVisibility(false)
    }
  }

  const handleDeleteComment = async (commentCreatedAt: string) => {
    if (!isOwner) {
      toast.error('Apenas o dono do post pode deletar comentários')
      return
    }

    try {
      const result = await deleteComment(post._id, commentCreatedAt)

      if (result.success) {
        setComments(prev => prev.filter(c => c.createdAt !== commentCreatedAt))
        toast.success('Comentário deletado!')
      } else {
        toast.error(result.message || 'Erro ao deletar comentário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao deletar comentário')
    }
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Há alguns momentos'
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
  }

  return (
    <TooltipProvider>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-2 w-[95vw] sm:w-auto post-modal-content ${
          isPortrait ? 'sm:max-w-2xl md:max-w-3xl' : 
          isLandscape ? 'sm:max-w-5xl md:max-w-6xl lg:max-w-7xl' : 
          'sm:max-w-3xl md:max-w-4xl lg:max-w-5xl'
        }`}
      >
        <div className="flex flex-col md:flex-row h-full max-h-[95vh] sm:max-h-[90vh]">
          <div className={`hidden md:flex items-center justify-center relative overflow-hidden ${
            isPortrait ? 'md:w-auto md:max-w-[400px] lg:max-w-[500px]' : 
            isLandscape ? 'md:flex-1 md:min-w-0' : 
            'md:w-auto md:max-w-[500px] lg:max-w-[650px]'
          }`}>
            <div className="relative w-full h-full flex items-center justify-center group">
              <Image
                src={post.imageUrl}
                alt={post.title || 'Post'}
                width={imageDimensions?.width || 800}
                height={imageDimensions?.height || 800}
                className={`${
                  isPortrait ? 'h-[90vh] w-auto object-cover' : 
                  isLandscape ? 'w-full h-auto max-h-[90vh] object-contain' : 
                  'max-h-[90vh] w-auto object-contain'
                } transition-transform duration-300 group-hover:scale-105`}
                priority
                onLoad={handleImageLoad}
              />
              {imageDimensions && (
                <Badge className="absolute bottom-4 right-4 bg-black/70 text-white hover:bg-black/80">
                  <Eye className="h-3 w-3 mr-1" />
                  {imageDimensions.width} × {imageDimensions.height}
                </Badge>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 lg:w-96 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="border-b p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-bold">
                    {post.user?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="font-bold text-xs sm:text-sm truncate">
                    {post.user?.username || 'Anônimo'}
                  </p>
                  {post.game && (
                    <Badge variant="secondary" className="text-[10px] w-fit mt-0.5">
                      {post.game}
                    </Badge>
                  )}
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatDate(post.createdAt)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="md:hidden relative w-full flex-shrink-0">
              <div className="relative w-full max-h-[50vh] group" style={{ aspectRatio: aspectRatio || 1 }}>
                <Image
                  src={post.imageUrl}
                  alt={post.title || 'Post'}
                  fill
                  className={`${isPortrait ? 'object-cover' : isLandscape ? 'object-contain' : 'object-cover'} transition-transform duration-300`}
                  priority
                  onLoad={handleImageLoad}
                />
                {imageDimensions && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                    {imageDimensions.width} × {imageDimensions.height}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-b p-3 sm:p-4 flex-shrink-0 overflow-y-auto max-h-[20vh] sm:max-h-none">
              {post.title && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm sm:text-base flex-1">{post.title}</h3>
                </div>
              )}
              {post.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                  {post.description}
                </p>
              )}
              {post.tags.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {post.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[10px] sm:text-xs hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
              {comments.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Nenhum comentário ainda. Seja o primeiro! 💬
                  </p>
                </div>
              )}
              {comments.map((comment, idx) => {
                const isCurrentUser = currentUserId && comment.userId === currentUserId
                const username = comment.username || 'Usuário'
                const displayName = isCurrentUser ? 'Você' : username
                const initial = displayName[0]?.toUpperCase() || 'U'
                
                return (
                <div key={idx} className="flex gap-2 sm:gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px] sm:text-xs">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm">
                      <span className="font-semibold">{displayName}</span>
                      {' '}
                      <span className="text-muted-foreground break-words">
                        {comment.text}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteComment(comment.createdAt)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )
              })}
            </div>

            <div className="border-t p-3 sm:p-4 flex gap-2 sm:gap-3 flex-shrink-0 items-center justify-between">
              <div className="flex gap-2 sm:gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={handleLike}
                        disabled={liking}
                        className={`flex items-center gap-1.5 sm:gap-2 font-semibold transition-all text-xs sm:text-sm h-8 sm:h-9 ${
                          isLiked
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`}
                        />
                        <span className="text-[10px] sm:text-xs font-bold">{likes}</span>
                      </Button>
                    </TooltipTrigger>
                   
                  </Tooltip>
                </TooltipProvider>
                
                <Button size="sm" disabled className="flex items-center gap-1.5 sm:gap-2 bg-secondary text-secondary-foreground text-xs sm:text-sm h-8 sm:h-9">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs">{comments.length}</span>
                </Button>
              </div>
              {isOwner && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility() }}
                        disabled={updatingVisibility}
                        style={{
                          backgroundColor: isPublic ? '#22c55e' : '#6b7280',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '2rem',
                          width: '2.5rem',
                          flexShrink: '0',
                          transition: 'opacity 0.2s',
                          cursor: updatingVisibility ? 'not-allowed' : 'pointer',
                          opacity: updatingVisibility ? '0.5' : '1'
                        }}
                        onMouseEnter={(e) => !updatingVisibility && (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => !updatingVisibility && (e.currentTarget.style.opacity = '1')}
                      >
                        {isPublic ? (
                          <Globe style={{ height: '1rem', width: '1rem' }} />
                        ) : (
                          <Lock style={{ height: '1rem', width: '1rem' }} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPublic ? 'Post público - clique para tornar privado' : 'Post privado - clique para tornar público'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {isAuthenticated && (
              <div className="border-t p-3 sm:p-4 flex gap-2 flex-shrink-0">
                <Input
                  placeholder="Adicione um comentário incrível..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleAddComment}
                        disabled={posting || !commentText.trim()}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 sm:h-10 w-8 sm:w-10 p-0"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enviar comentário</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}
