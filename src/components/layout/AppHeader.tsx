'use client'

import { useRouter } from 'next/navigation'
import ProfileMenu from '@/components/layout/ProfileMenu'
import { Button } from '@/components/ui/button'
import { Plus, Gamepad2, Globe, User } from 'lucide-react'

interface AppHeaderProps {
  username: string
  userId: string
  currentPage: 'user' | 'public'
}

export default function AppHeader({ username, userId, currentPage }: AppHeaderProps) {
  const router = useRouter()

  const isUserPage = currentPage === 'user'
  const isPublicPage = currentPage === 'public'

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
        <Button
          onClick={() => router.push(`/user/${userId}`)}
          variant="ghost"
          className="flex items-center gap-2 sm:gap-3 min-w-0 h-auto px-0 hover:bg-transparent"
        >
          <div className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors">
            <Gamepad2 className="h-6 sm:h-7 w-6 sm:w-7 text-primary flex-shrink-0" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
            Gamelogue
          </h1>
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Botão alternador - Mobile (apenas ícone) */}
          {isUserPage && (
            <Button
              onClick={() => router.push('/public')}
              variant="outline"
              size="icon"
              className="sm:hidden h-9 w-9"
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}
          {isPublicPage && (
            <Button
              onClick={() => router.push(`/user/${userId}`)}
              variant="outline"
              size="icon"
              className="sm:hidden h-9 w-9"
            >
              <User className="h-4 w-4" />
            </Button>
          )}
          
          {/* Botão alternador - Desktop (com texto) */}
          {isUserPage && (
            <Button
              onClick={() => router.push('/public')}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-9 sm:h-10"
            >
              <Globe className="h-4 w-4 mr-2" />
              Comunidade
            </Button>
          )}
          {isPublicPage && (
            <Button
              onClick={() => router.push(`/user/${userId}`)}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-9 sm:h-10"
            >
              <User className="h-4 w-4 mr-2" />
              Meus Posts
            </Button>
          )}
          
          {/* Novo Post */}
          <Button
            onClick={() => router.push(`/user/${userId}/novo-post`)}
            variant="default"
            size="sm"
            className="h-9 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-medium"
          >
            <Plus className="h-4 w-4 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Novo Post</span>
          </Button>
          
          <ProfileMenu username={username} userId={userId} />
        </div>
      </div>
    </header>
  )
}
