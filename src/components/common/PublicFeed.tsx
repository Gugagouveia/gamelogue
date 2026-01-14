'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { PostWithUser } from '@/domain/entities/Post'
import { getPublicPosts } from '@/server/actions/posts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { FeedSkeletonGrid } from '@/components/ui/skeleton'
import { PostModal } from './PostModal'
import { toast } from 'sonner'

export default function PublicFeed() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<PostWithUser | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMorePosts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getPublicPosts({ page, limit: 12 })

      if (result.success && result.posts.length > 0) {
        setPosts(prev => (page === 1 ? result.posts : [...prev, ...result.posts]))
        setHasMore(result.posts.length >= 12)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Erro ao carregar posts públicos:', error)
      toast.error('Erro ao carregar posts públicos')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  useEffect(() => {
    loadMorePosts()
  }, [page, loadMorePosts])

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <FeedSkeletonGrid />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">Posts Públicos da Comunidade</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {posts.map(post => (
          <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setSelectedPost(post)}>
            <div className="relative aspect-square bg-muted">
              <Image src={post.imageUrl} alt={post.title || 'Post'} fill className="object-cover" />
            </div>
            <CardHeader className="space-y-2 p-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {post.user?.username?.[0]?.toUpperCase() || post.userId?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-xs truncate">{post.user?.username || post.userId || 'Usuário'}</p>
                </div>
              </div>
              {post.title && <h3 className="text-xs font-bold line-clamp-1">{post.title}</h3>}
            </CardHeader>
            <CardContent className="space-y-1 p-2 pt-0">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-0">#{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div ref={observerTarget} className="mt-12 flex justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground">Fim dos posts públicos 🎮</p>
        )}
      </div>
      {selectedPost && (
        <PostModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} isAuthenticated={false} />
      )}
    </div>
  )
}
