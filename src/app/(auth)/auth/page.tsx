'use client'

import LoginForm from '@/features/auth/LoginForm'
import RegisterForm from '@/features/auth/RegisterForm'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gamepad2 } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3 group">
            <Gamepad2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
            <h1 className="text-4xl font-bold text-foreground">
              Gamelogue
            </h1>
          </Link>
          <p className="text-muted-foreground mt-3">
            Compartilhe suas melhores capturas de tela
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  )
}
