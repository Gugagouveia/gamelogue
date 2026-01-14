import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import UserPageClient from './UserPageClient'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export default async function UserPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    redirect('/auth')
  }

  try {
    const { payload } = await jwtVerify(token.value, SECRET_KEY)
    const username = (payload.username as string) || (payload.email as string)?.split('@')[0]
    const userId = (payload.userId as string) || username
    
    return <UserPageClient username={username} userId={userId} isAuthenticated={true} />
  } catch {
    redirect('/auth')
  }
}
