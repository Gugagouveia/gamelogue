'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SafeUser } from '@/domain/entities/User'
import ProfileForm from '@/features/auth/ProfileForm'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User as UserIcon, Mail, Calendar, Key } from 'lucide-react'

interface ProfilePageClientProps {
  user: SafeUser
}

export default function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const [user, setUser] = useState(initialUser)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <Button
            onClick={() => router.push(`/user/${user.username}`)}
            variant="ghost"
            className="flex items-center gap-1.5 sm:gap-2 h-auto px-0 hover:bg-transparent text-primary font-semibold"
          >
            <div className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm">Voltar</span>
          </Button>
          
          <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-center flex-1">
            Editar Perfil
          </h1>
          
          <ThemeToggle />
        </div>
      </header>      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">        <div className="space-y-4 sm:space-y-6">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Informações da Conta</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-background/50 border border-border/30">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</label>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mt-1 break-all">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-background/50 border border-border/30">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground">ID do Usuário</label>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mt-1 font-mono break-all">{user.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-background/50 border border-border/30">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground">Membro desde</label>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Editar Informações</h2>
            </div>
            <ProfileForm user={user} onSuccess={setUser} />
          </div>
        </div>
      </main>
    </div>
  )
}
