'use client'

import { useRouter } from 'next/navigation'
import PublicFeed from '@/components/common/PublicFeed'
import ProfileMenu from '@/components/layout/ProfileMenu'
import { Button } from '@/components/ui/button'
import { Plus, Gamepad2, User } from 'lucide-react'

interface PublicPageClientProps {
  username: string
  userId: string
  isAuthenticated: boolean
}

export default function PublicPageClient({ username, userId, isAuthenticated }: PublicPageClientProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-7 w-7 text-primary flex-shrink-0" />
            <h1 className="text-2xl font-bold text-foreground">
              Gamelogue
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push(`/user/${userId}`)}
              variant="outline"
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              Meus Posts
            </Button>
            <Button
              onClick={() => router.push(`/user/${userId}/novo-post`)}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
            <ProfileMenu username={username} userId={userId} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <PublicFeed isAuthenticated={isAuthenticated} currentUsername={username} currentUserId={userId} />
      </main>
    </div>
  )
}
