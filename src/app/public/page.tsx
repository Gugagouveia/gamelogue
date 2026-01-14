import PublicFeed from '@/components/common/PublicFeed'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Gamepad2 } from 'lucide-react'

export default function PublicPage() {
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
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <PublicFeed />
      </main>
    </div>
  )
}
