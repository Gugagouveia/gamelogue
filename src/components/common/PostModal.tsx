'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MessageCircle, Send, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { toggleLike, addComment, updatePostVisibility } from '@/server/actions/posts'
import type { PostWithUser } from '@/domain/entities/Post'

interface PostModalProps {
  post: PostWithUser
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  isOwner?: boolean
}

export function PostModal({ post, isOpen, onClose, isAuthenticated, isOwner = false }: PostModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(post.likesCount)
  const [comments, setComments] = useState<Array<{ userId: string; text: string; createdAt: string }>>([])
  const [commentText, setCommentText] = useState('')
  const [liking, setLiking] = useState(false)
  const [posting, setPosting] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isPublic, setIsPublic] = useState(post.isPublic || false)
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden bg-white border border-gray-300 w-[95vw] sm:w-auto ${
        isPortrait ? 'sm:max-w-2xl md:max-w-3xl' : 
        isLandscape ? 'sm:max-w-5xl md:max-w-6xl lg:max-w-7xl' : 
        'sm:max-w-3xl md:max-w-4xl lg:max-w-5xl'
      }`}>
        <div className="flex flex-col md:flex-row h-full max-h-[95vh] sm:max-h-[90vh]">
          {/* Imagem do Post - Desktop */}
          <div className={`hidden md:flex bg-white items-center justify-center relative overflow-hidden ${
            isPortrait ? 'md:w-auto md:max-w-[400px] lg:max-w-[500px]' : 
            isLandscape ? 'md:flex-1 md:min-w-0' : 
            'md:w-auto md:max-w-[500px] lg:max-w-[650px]'
          }`}>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={post.imageUrl}
                alt={post.title || 'Post'}
                width={imageDimensions?.width || 800}
                height={imageDimensions?.height || 800}
                className={`${
                  isPortrait ? 'h-[90vh] w-auto object-cover' : 
                  isLandscape ? 'w-full h-auto max-h-[90vh] object-contain' : 
                  'max-h-[90vh] w-auto object-contain'
                }`}
                priority
                onLoad={handleImageLoad}
              />
            </div>
          </div>

          {/* Detalhes do Post */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white max-h-[95vh] sm:max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-gray-300 p-3 sm:p-4 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <AvatarFallback className="bg-black text-white text-xs sm:text-sm font-bold">
                    {post.user?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-black truncate">
                    {post.user?.username || 'Anônimo'}
                  </p>
                  {post.game && (
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">{post.game}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Imagem Mobile */}
            <div className="md:hidden relative w-full bg-white flex-shrink-0">
              <div className="relative w-full max-h-[50vh]" style={{ aspectRatio: aspectRatio || 1 }}>
                <Image
                  src={post.imageUrl}
                  alt={post.title || 'Post'}
                  fill
                  className={`${isPortrait ? 'object-cover' : isLandscape ? 'object-contain' : 'object-cover'}`}
                  priority
                  onLoad={handleImageLoad}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="border-b border-gray-300 p-3 sm:p-4 flex-shrink-0 bg-white overflow-y-auto max-h-[20vh] sm:max-h-none">
              {post.title && (
                <h3 className="font-bold text-sm sm:text-base text-black mb-1 sm:mb-2">{post.title}</h3>
              )}
              {post.description && (
                <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 leading-relaxed">
                  {post.description}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] sm:text-xs bg-gray-200 text-black font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comentários */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white min-h-0">
              {comments.length === 0 && (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">
                  Nenhum comentário ainda. Seja o primeiro! 💬
                </p>
              )}
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-2 sm:gap-3">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-300 text-black text-[10px] sm:text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-black">
                      <span className="font-semibold">Você</span>
                      {' '}
                      <span className="text-gray-600 break-words">
                        {comment.text}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="border-t border-gray-300 p-3 sm:p-4 flex gap-2 sm:gap-3 bg-white flex-shrink-0 items-center justify-between">
              <div className="flex gap-2 sm:gap-3">
                <Button
                  size="sm"
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1.5 sm:gap-2 font-semibold transition-all text-xs sm:text-sm h-8 sm:h-9 ${
                    isLiked
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'fill-current' : ''}`}
                  />
                  <span className="text-[10px] sm:text-xs">{likes}</span>
                </Button>
                <Button size="sm" disabled className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 text-black text-xs sm:text-sm h-8 sm:h-9">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-[10px] sm:text-xs">{comments.length}</span>
                </Button>
              </div>
              {isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleVisibility() }}
                  disabled={updatingVisibility}
                  className={`flex items-center justify-center p-1.5 sm:p-2 rounded-md transition-all text-xs sm:text-sm h-8 sm:h-9 w-8 sm:w-10 flex-shrink-0 ${
                    isPublic
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isPublic ? 'Público' : 'Privado'}
                >
                  {isPublic ? (
                    <Globe className="h-4 w-4 sm:h-4 sm:w-4" />
                  ) : (
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Input de Comentário */}
            {isAuthenticated && (
              <div className="border-t border-gray-300 p-3 sm:p-4 flex gap-2 bg-white flex-shrink-0">
                <Input
                  placeholder="Adicione um comentário..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                  className="text-xs sm:text-sm border-gray-300 bg-white text-black h-8 sm:h-10"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={posting || !commentText.trim()}
                  size="sm"
                  className="bg-black hover:bg-gray-900 text-white font-semibold h-8 sm:h-10 w-8 sm:w-10 p-0"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
