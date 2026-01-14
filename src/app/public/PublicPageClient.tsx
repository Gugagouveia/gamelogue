'use client'

import Feed from '@/components/common/Feed'
import AppHeader from '@/components/layout/AppHeader'

interface PublicPageClientProps {
  username: string
  userId: string
  isAuthenticated: boolean
}

export default function PublicPageClient({ username, userId, isAuthenticated }: PublicPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader username={username} userId={userId} currentPage="public" />

      <main>
        <Feed 
          isAuthenticated={isAuthenticated} 
          currentUsername={username} 
          currentUserId={userId}
          mode="public"
          title="Posts Públicos da Comunidade"
        />
      </main>
    </div>
  )
}
