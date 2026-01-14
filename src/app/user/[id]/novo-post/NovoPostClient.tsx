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
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <Button
            onClick={handleBack}
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
          
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-medium flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <UploadForm onSuccess={handleSuccess} />
      </main>
    </div>
  )
}
