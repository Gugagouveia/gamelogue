'use client'

import { useState } from 'react'
import { register } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Eye, EyeOff, Sparkles, Mail, Lock as LockIcon, User, Check, X } from 'lucide-react'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const getPasswordStrength = () => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({ username: '', email: '', password: '', confirmPassword: '' })

    // Validar senhas coincidem
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, password: 'As senhas não coincidem', confirmPassword: 'As senhas não coincidem' }))
      return
    }

    setLoading(true)

    try {
      const result = await register({ email, password, username })

      if (result.success) {
        const redirectUrl =
          (result as { success: boolean; redirectTo?: string }).redirectTo || '/user/default'
        window.location.href = redirectUrl
      } else {
        // Identificar qual campo causou o erro
        const errorMsg = result.error || 'Erro ao criar conta'
        
        if (errorMsg.includes('Username já está em uso')) {
          setFieldErrors(prev => ({ ...prev, username: errorMsg }))
        } else if (errorMsg.includes('Email já está em uso')) {
          setFieldErrors(prev => ({ ...prev, email: errorMsg }))
        } else {
          setError(errorMsg)
        }
      }
    } catch {
      setError('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setFieldErrors(prev => ({ ...prev, username: '' }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setFieldErrors(prev => ({ ...prev, email: '' }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setFieldErrors(prev => ({ ...prev, password: '', confirmPassword: '' }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-3 pb-3 sm:pb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Criar conta</CardTitle>
        <CardDescription className="text-center text-xs sm:text-sm">
          Preencha os dados abaixo para criar sua conta
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
            <Label htmlFor="username" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              Nome de usuário
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="seunome"
              value={username}
              onChange={handleUsernameChange}
              className="h-10 sm:h-12 text-sm"
              style={fieldErrors.username ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}
            />
            {fieldErrors.username && (
              <p className="text-xs text-destructive font-medium mt-1">{fieldErrors.username}</p>
            )}
            <p className="text-xs text-muted-foreground">Mínimo 3 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleEmailChange}
              className="h-10 sm:h-12 text-sm"
              style={fieldErrors.email ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive font-medium mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <LockIcon className="h-4 w-4 flex-shrink-0" />
              Senha *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="pr-10 h-10 sm:h-12 text-sm"
                style={fieldErrors.password ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}
                required
                minLength={6}
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
            {fieldErrors.password && (
              <p className="text-xs text-destructive font-medium mt-1">{fieldErrors.password}</p>
            )}
            {password && (
              <div className="space-y-2 mt-2 sm:mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Força da senha:</span>
                  <Badge 
                    variant={passwordStrength < 50 ? "destructive" : passwordStrength < 75 ? "secondary" : "default"}
                    className="text-[10px] sm:text-xs py-0.5"
                  >
                    {passwordStrength < 50 ? 'Fraca' : passwordStrength < 75 ? 'Média' : 'Forte'}
                  </Badge>
                </div>
                <Progress value={passwordStrength} className="h-2" />
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${password.length >= 6 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {password.length >= 6 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Mínimo 6 caracteres
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Letra maiúscula
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Número
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <LockIcon className="h-4 w-4 flex-shrink-0" />
              Confirmar senha *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="pr-10 h-10 sm:h-12 text-sm"
                style={fieldErrors.confirmPassword ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-destructive font-medium mt-1">{fieldErrors.confirmPassword}</p>
            )}
            {confirmPassword && !fieldErrors.confirmPassword && (
              <div className={`flex items-center gap-2 text-xs mt-2 ${password === confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                {password === confirmPassword ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {password === confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
              </div>
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
                <span className="hidden sm:inline">Criando conta...</span>
                <span className="sm:hidden">Criando</span>
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Registrar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
