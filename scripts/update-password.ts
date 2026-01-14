import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.DATABASE_URL

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL não está definida no .env')
  process.exit(1)
}

async function updatePassword() {
  const client = new MongoClient(MONGODB_URI!)

  try {
    await client.connect()
    const db = client.db('gamelogue')
    const users = db.collection('User')

    const email = 'admin@gamelogue.com'
    const newPassword = 'guga123'

    const passwordHash = await bcrypt.hash(newPassword, 12)

    const result = await users.updateOne({ email }, { $set: { passwordHash } })

    if (result.matchedCount === 0) {
      console.log('❌ Usuário não encontrado!')
      return
    }

    console.log('✅ Senha atualizada com sucesso!')
    console.log(`Email: ${email}`)
    console.log(`Nova senha: ${newPassword}`)
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error)
  } finally {
    await client.close()
  }
}

updatePassword()
