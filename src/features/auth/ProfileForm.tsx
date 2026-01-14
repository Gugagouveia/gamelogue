'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/server/actions/users'
import { SafeUser } from '@/domain/entities/User'
import { Check, X } from 'lucide-react'

interface ProfileFormProps {
  user: SafeUser
  onSuccess?: (updatedUser: SafeUser) => void
}

export default function ProfileForm({ user, onSuccess }: ProfileFormProps) {
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await updateUserProfile({
      username: username.trim(),
      bio: bio.trim(),
    })

    if (result.success && result.user) {
      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => {
        onSuccess?.(result.user!)
      }, 1000)
    } else {
      setError(result.error || 'Erro ao atualizar perfil')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-500 text-sm font-medium">{success}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Seu nome de usuário"
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          minLength={3}
          maxLength={30}
        />
        <p className="text-xs text-muted-foreground mt-2">{username.length} / 30 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Fale um pouco sobre você..."
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground resize-none"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-2">{bio.length} / 500 caracteres</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}

