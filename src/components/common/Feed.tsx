'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { getPosts, deletePost, getPublicPosts } from '@/server/actions/posts'
import type { PostWithUser } from '@/domain/entities/Post'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { FeedSkeletonGrid } from '@/components/ui/skeleton'
import { PostInteractions } from './PostInteractions'
import { PostModal } from './PostModal'
import { toast } from 'sonner'

interface FeedProps {
  isAuthenticated?: boolean
  currentUsername?: string
  currentUserId?: string
  mode?: 'user' | 'public'
  title?: string
}

export default function Feed({ 
  isAuthenticated = false, 
  currentUsername, 
  currentUserId,
  mode = 'user',
  title
}: FeedProps) {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostWithUser | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  const isPublicMode = mode === 'public'
  const itemsPerPage = isPublicMode ? 12 : 10

  const loadMorePosts = useCallback(async () => {
    try {
      setLoading(true)
      const result = isPublicMode 
        ? await getPublicPosts({ page, limit: itemsPerPage })
        : await getPosts({ page, limit: itemsPerPage })

      if (result.success && result.posts.length > 0) {
        if (page === 1) {
          setPosts(result.posts)
        } else {
          setPosts(prev => [...prev, ...result.posts])
        }
        setHasMore(result.posts.length >= itemsPerPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      toast.error('Erro ao carregar posts')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page, isPublicMode, itemsPerPage])

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading])

  // Carrega posts quando página muda
  useEffect(() => {
    loadMorePosts()
  }, [page, loadMorePosts])

  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const handlePostUpdate = (postId: string, updates: { likesCount?: number; commentsCount?: number; likes?: string[] }) => {
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          likesCount: updates.likesCount ?? p.likesCount,
          commentsCount: updates.commentsCount ?? p.commentsCount,
          likes: updates.likes ?? p.likes
        }
      }
      return p
    }))
    
    // Atualiza também o selectedPost se for o mesmo
    if (selectedPost && selectedPost._id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        likesCount: updates.likesCount ?? prev.likesCount,
        commentsCount: updates.commentsCount ?? prev.commentsCount,
        likes: updates.likes ?? prev.likes
      } : null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!postToDelete) return

    setDeleting(postToDelete)
    setDeleteDialogOpen(false)

    try {
      const result = await deletePost(postToDelete)

      if (result.success) {
        setPosts(prev => prev.filter(p => p._id !== postToDelete))
        toast.success('Post deletado com sucesso')
      } else {
        toast.error(`Erro: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      toast.error('Erro ao deletar post')
    } finally {
      setDeleting(null)
      setPostToDelete(null)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <FeedSkeletonGrid />
      </div>
    )
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
        <div className="text-muted-foreground space-y-2">
          <p className="text-base sm:text-lg font-medium">Nenhum post ainda</p>
          <p className="text-xs sm:text-sm">Seja o primeiro a compartilhar! 🎮</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {title && <h1 className="text-xl font-bold mb-4">{title}</h1>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {posts.map(post => (
          <Card
            key={post._id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            {/* Image */}
            <div className="relative aspect-square bg-muted">
              <Image
                src={post.imageUrl}
                alt={post.title || 'Post'}
                fill
                className="object-cover"
              />
            </div>

            <CardHeader className="space-y-2 p-2 flex-1 flex flex-col">
              {/* User & Delete Button */}
              <div className="flex items-center justify-between gap-1 min-h-fit">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {post.user?.username?.[0]?.toUpperCase() ||
                        post.userId?.[0]?.toUpperCase() ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-semibold text-xs truncate">
                      {post.user?.username || post.userId || 'Usuário'}
                    </p>
                    {post.game && (
                      <p className="text-xs text-muted-foreground truncate">{post.game}</p>
                    )}
                  </div>
                </div>

                {!isPublicMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); openDeleteDialog(post._id) }}
                    disabled={deleting === post._id}
                    className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 flex-shrink-0"
                  >
                    {deleting === post._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>

              {/* Title */}
              {post.title && (
                <h3 className="text-xs font-bold line-clamp-1">{post.title}</h3>
              )}
            </CardHeader>

            <CardContent className="space-y-1 p-2 pt-0 flex-1">
              {/* Description */}
              {post.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {post.description}
                </p>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-2 pt-1">
              {/* Stats */}
              <PostInteractions
                postId={post._id}
                initialLikes={post.likesCount}
                initialComments={post.commentsCount}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                userLikes={post.likes}
                onPostUpdate={handlePostUpdate}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerTarget} className="mt-12 flex justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground">
            {isPublicMode ? 'Fim dos posts públicos 🎮' : 'Fim dos posts 🎮'}
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {!isPublicMode && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Deletar post?</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. O post será deletado permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting !== null}
              >
                {deleting ? 'Deletando...' : 'Deletar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          isAuthenticated={isAuthenticated}
          isOwner={isAuthenticated && currentUsername === selectedPost.userId}
          currentUserId={currentUserId}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </div>
  )
}
