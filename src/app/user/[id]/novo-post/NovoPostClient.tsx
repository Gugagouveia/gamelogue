'use client'

import { useRouter } from 'next/navigation'
import UploadForm from '@/features/post/UploadForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Gamepad2 } from 'lucide-react'

interface NovoPostClientProps {
  userId: string
}

export default function NovoPostClient({ userId }: NovoPostClientProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/user/${userId}`)
  }

  const handleBack = () => {
    router.back()
  }

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
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UploadForm onSuccess={handleSuccess} />
      </main>
    </div>
  )
}
