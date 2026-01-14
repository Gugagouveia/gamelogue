import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export default async function RootPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, SECRET_KEY)
      const username = (payload.username as string) || (payload.email as string)?.split('@')[0]
      redirect(`/user/${username}`)
    } catch {
      redirect('/auth')
    }
  } else {
    redirect('/auth')
  }
}
