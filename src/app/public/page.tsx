import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import PublicPageClient from './PublicPageClient'


export default async function PublicPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/auth')
  }

  let username: string
  let userId: string

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    username = payload.username as string
    userId = payload.userId as string
  } catch (error) {
    console.error('Token inválido:', error)
    redirect('/auth')
  }

  return (
    <PublicPageClient 
      username={username}
      userId={userId}
      isAuthenticated={true}
    />
  )
}
