import Feed from './Feed'
import { getCurrentUser } from '@/server/actions/auth'

export async function FeedWrapper() {
  const { success: isAuthenticated } = await getCurrentUser()

  return <Feed isAuthenticated={isAuthenticated} />
}
