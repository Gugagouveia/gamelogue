'use client'

import { useState } from 'react'
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
}

export function PostInteractions({
  postId,
  initialLikes,
  initialComments,
  isAuthenticated,
}: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [comments, setComments] = useState<Array<{ userId: string; text: string; createdAt: string }>>([])
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={liking}
          className={isLiked ? 'text-red-500' : ''}
        >
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCommentsOpen(true)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{initialComments}</span>
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
