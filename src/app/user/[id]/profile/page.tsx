import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import { UserRepository } from '@/server/repositories/UserRepository'
import { ObjectId } from 'mongodb'
import ProfilePageClient from './ProfilePageClient'


export default async function ProfilePage({ }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/auth')
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key')
  const verified = await jwtVerify(token, secret)
  const userId = verified.payload.userId as string

  if (!userId || !ObjectId.isValid(userId)) {
    redirect('/auth')
  }

  const userRepo = new UserRepository()
  const user = await userRepo.findById(userId)

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Usuário não encontrado</h1>
          <p className="text-gray-600">Este usuário não existe ou foi removido.</p>
        </div>
      </div>
    )
  }

  return <ProfilePageClient user={user} />
}
