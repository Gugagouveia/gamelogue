'use client'

import { useState, useEffect, useRef } from 'react'
import { toggleLike, addComment } from '@/server/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Heart, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PostInteractionsProps {
  postId: string
  initialLikes: number
  initialComments: number
  isAuthenticated: boolean
  currentUserId?: string
  userLikes?: string[]
  onPostUpdate?: (postId: string, updates: { likesCount?: number; commentsCount?: number; likes?: string[] }) => void
}

export function PostInteractions({
  postId,
  initialLikes,
  initialComments,
  isAuthenticated,
  currentUserId,
  userLikes,
  onPostUpdate,
}: PostInteractionsProps) {
  const lastPostIdRef = useRef(postId)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(() => {
    return currentUserId ? (userLikes?.includes(currentUserId) ?? false) : false
  })
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState<Array<{ userId: string; text: string; createdAt: string }>>([])
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    // Atualiza quando o post mudar OU quando os likes/count mudarem de fora (via onPostUpdate)
    const newIsLiked = currentUserId ? (userLikes?.includes(currentUserId) ?? false) : false
    const newLikesCount = initialLikes
    
    if (postId !== lastPostIdRef.current) {
      // Post diferente - sempre atualiza
      lastPostIdRef.current = postId
      setIsLiked(newIsLiked)
      setLikes(newLikesCount)
    } else {
      // Mesmo post - só atualiza se os valores realmente mudaram (sincronização externa)
      setIsLiked(newIsLiked)
      setLikes(newLikesCount)
    }
  }, [postId, userLikes, currentUserId, initialLikes])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar autenticado para dar like')
      return
    }

    setLiking(true)
    try {
      const result = await toggleLike(postId)

      if (result.success && 'liked' in result) {
        if (result.liked) {
          const newLikes = [...(userLikes || []), currentUserId || '']
          setLikes(prev => prev + 1)
          setIsLiked(true)
          onPostUpdate?.(postId, { likesCount: likes + 1, likes: newLikes })
          toast.success('Post curtido!')
        } else {
          const newLikes = (userLikes || []).filter(id => id !== currentUserId)
          setLikes(prev => Math.max(0, prev - 1))
          setIsLiked(false)
          onPostUpdate?.(postId, { likesCount: Math.max(0, likes - 1), likes: newLikes })
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
      const result = await addComment(postId, commentText)

      if (result.success) {
        setComments(prev => [...prev, { userId: '', text: commentText, createdAt: new Date().toISOString() }])
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

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleLike()
          }}
          disabled={liking}
          style={isLiked ? { backgroundColor: '#ef4444', color: 'white' } : undefined}
          className={`flex items-center gap-1.5 font-semibold transition-all text-xs h-8 ${
            isLiked
              ? 'hover:opacity-90'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              isLiked ? 'scale-110' : ''
            }`}
            fill={isLiked ? 'white' : 'none'}
            stroke={isLiked ? 'white' : 'currentColor'}
          />
          <span className="text-[10px] font-bold">{likes}</span>
        </Button>

        <Button
          size="sm"
          disabled
          className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs h-8"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-[10px]">{initialComments}</span>
        </Button>
      </div>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentários</DialogTitle>
            <DialogDescription>
              Veja e adicione comentários ao post
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length === 0 && initialComments === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum comentário ainda</p>
            ) : (
              comments.map((comment, idx) => (
                <div key={idx} className="border-b pb-2">
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {isAuthenticated && (
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddComment()}
              />
              <Button
                onClick={handleAddComment}
                disabled={posting}
                size="sm"
              >
                {posting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
