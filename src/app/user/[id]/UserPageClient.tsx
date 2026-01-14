'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Feed from '@/components/common/Feed'
import UploadForm from '@/features/post/UploadForm'
import ProfileMenu from '@/components/layout/ProfileMenu'
import { Button } from '@/components/ui/button'
import { Plus, X, Gamepad2, Globe } from 'lucide-react'

interface UserPageClientProps {
  username: string
  userId: string
  isAuthenticated: boolean
}

export default function UserPageClient({ username, userId, isAuthenticated }: UserPageClientProps) {
  const [showUpload, setShowUpload] = useState(false)
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
              onClick={() => router.push('/public')}
              variant="outline"
              size="sm"
            >
              <Globe className="h-4 w-4 mr-2" />
              Comunidade
            </Button>
            <Button
              onClick={() => setShowUpload(!showUpload)}
              variant={showUpload ? 'outline' : 'default'}
              size="sm"
            >
              {showUpload ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </>
              )}
            </Button>
            <ProfileMenu username={username} userId={userId} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showUpload && (
          <div className="mb-8">
            <UploadForm onSuccess={() => setShowUpload(false)} />
          </div>
        )}
        <Feed isAuthenticated={isAuthenticated} currentUsername={username} />
      </main>
    </div>
  )
}
