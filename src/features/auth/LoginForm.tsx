'use client'

import { useState } from 'react'
import { login } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LogIn, Eye, EyeOff, Sparkles, Mail, Lock as LockIcon } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setHasError(false)
    setLoading(true)

    try {
      const result = await login({ email, password })

      if (result.success) {
        const redirectUrl =
          (result as { success: boolean; redirectTo?: string }).redirectTo || '/user/default'
        window.location.href = redirectUrl
      } else {
        setError(result.error || 'Email ou senha incorretos')
        setHasError(true)
      }
    } catch {
      setError('Email ou senha incorretos')
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (hasError) setHasError(false)
    if (error) setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (hasError) setHasError(false)
    if (error) setError('')
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-3 pb-3 sm:pb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-center text-xs sm:text-sm">
          Entre com suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      <Separator className="mb-4 sm:mb-6" />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 sm:p-4 bg-destructive/10 border-l-4 border-destructive rounded-md animate-in slide-in-from-top-2">
              <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleEmailChange}
              style={hasError ? { borderColor: 'hsl(var(--destructive))', borderWidth: '2px' } : {}}
              className="h-10 sm:h-12 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <LockIcon className="h-4 w-4 flex-shrink-0" />
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                style={hasError ? { borderColor: 'hsl(var(--destructive))', borderWidth: '2px' } : {}}
                className="pr-10 h-10 sm:h-12 text-sm"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent"
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
            {hasError && error && (
              <p className="text-xs sm:text-sm text-destructive font-medium mt-1 animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="hidden sm:inline">Entrando...</span>
                <span className="sm:hidden">Entrando</span>
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Entrar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
