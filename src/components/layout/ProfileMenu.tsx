'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/server/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, Upload } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

interface ProfileMenuProps {
  username: string
  userId: string
}

export default function ProfileMenu({ username, userId }: ProfileMenuProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = () => {
    router.push(`/user/${userId}/profile`)
  }

  const handleUserPageClick = () => {
    router.push(`/user/${userId}`)
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-primary/20 hover:border-primary/40 h-9 sm:h-10 w-9 sm:w-10 p-1"
          >
            <Avatar className="h-8 sm:h-9 w-8 sm:w-9">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs sm:text-sm">
                {username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 sm:w-64 rounded-xl shadow-2xl border border-border/50 bg-background/95 backdrop-blur-md p-0 animate-in fade-in-0 zoom-in-95">
        
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-border/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-10 sm:h-12 w-10 sm:w-12 border-2 border-primary/20 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                  {username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{username}</p>
                <p className="text-xs text-muted-foreground">Conectado</p>
              </div>
            </div>
          </div>
     
          <div className="px-2 py-2 sm:py-3 space-y-0.5 sm:space-y-1">
            <DropdownMenuItem 
              onClick={handleUserPageClick} 
              className="cursor-pointer h-10 sm:h-11 rounded-lg px-2 sm:px-3 transition-all hover:bg-accent/80 focus:bg-accent/80 text-xs sm:text-sm"
            >
              <Upload className="mr-2 sm:mr-3 h-4 w-4 text-primary/70 flex-shrink-0" />
              <span className="font-medium text-foreground">Meus Posts</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleProfileClick} 
              className="cursor-pointer h-10 sm:h-11 rounded-lg px-2 sm:px-3 transition-all hover:bg-accent/80 focus:bg-accent/80 text-xs sm:text-sm"
            >
              <User className="mr-2 sm:mr-3 h-4 w-4 text-primary/70 flex-shrink-0" />
              <span className="font-medium text-foreground">Ver Perfil</span>
            </DropdownMenuItem>
          </div>

          <div className="px-2 py-2 sm:py-3 border-t border-border/30">
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loading}
              className="cursor-pointer h-10 sm:h-11 rounded-lg px-2 sm:px-3 transition-all text-destructive hover:bg-destructive/10 focus:bg-destructive/10 text-xs sm:text-sm"
            >
              <LogOut className="mr-2 sm:mr-3 h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{loading ? 'Saindo...' : 'Sair'}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
