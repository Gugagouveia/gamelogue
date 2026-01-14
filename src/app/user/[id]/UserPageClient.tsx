'use client'

import Feed from '@/components/common/Feed'
import AppHeader from '@/components/layout/AppHeader'

interface UserPageClientProps {
  username: string
  userId: string
  isAuthenticated: boolean
}

export default function UserPageClient({ username, userId, isAuthenticated }: UserPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AppHeader username={username} userId={userId} currentPage="user" />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Feed isAuthenticated={isAuthenticated} currentUsername={username} currentUserId={userId} />
      </main>
    </div>
  )
}
