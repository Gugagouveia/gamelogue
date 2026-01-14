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
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all">
            <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl border border-border/50 bg-background backdrop-blur-sm p-0">
        
          <div className="px-4 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base">
                  {username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{username}</p>
                <p className="text-xs text-muted-foreground">Conectado</p>
              </div>
            </div>
          </div>
     
          <div className="px-2 py-3 space-y-1">
            <DropdownMenuItem 
              onClick={handleUserPageClick} 
              className="cursor-pointer h-10 rounded-lg px-3 transition-all hover:bg-accent/80 focus:bg-accent/80"
            >
              <Upload className="mr-3 h-5 w-5 text-primary/70" />
              <span className="text-sm font-medium text-foreground">Meus Posts</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleProfileClick} 
              className="cursor-pointer h-10 rounded-lg px-3 transition-all hover:bg-accent/80 focus:bg-accent/80"
            >
              <User className="mr-3 h-5 w-5 text-primary/70" />
              <span className="text-sm font-medium text-foreground">Ver Perfil</span>
            </DropdownMenuItem>
          </div>

          <div className="px-2 py-3 border-t border-border/30">
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loading}
              className="cursor-pointer h-10 rounded-lg px-3 transition-all text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-sm font-medium">{loading ? 'Saindo...' : 'Sair'}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
