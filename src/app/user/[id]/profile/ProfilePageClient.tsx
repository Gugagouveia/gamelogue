'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SafeUser } from '@/domain/entities/User'
import ProfileForm from '@/features/auth/ProfileForm'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ArrowLeft, User as UserIcon, Mail, Calendar, Key } from 'lucide-react'

interface ProfilePageClientProps {
  user: SafeUser
}

export default function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const [user, setUser] = useState(initialUser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/user/${user.username}`}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Editar Perfil
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Informações da Conta</h2>
            </div>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <Mail className="h-5 w-5 text-primary/70 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</label>
                  <p className="text-sm font-semibold text-foreground mt-1">{user.email}</p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <Key className="h-5 w-5 text-primary/70 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">ID do Usuário</label>
                  <p className="text-sm font-semibold text-foreground mt-1 font-mono">{user.id}</p>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <Calendar className="h-5 w-5 text-primary/70 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Membro desde</label>
                  <p className="text-sm font-semibold text-foreground mt-1">
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

          {/* Edit Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Editar Informações</h2>
            </div>
            <ProfileForm user={user} onSuccess={setUser} />
          </div>
        </div>
      </main>
    </div>
  )
}
