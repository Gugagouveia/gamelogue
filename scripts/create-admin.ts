import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.DATABASE_URL

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL não está definida no .env')
  process.exit(1)
}

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI!)

  try {
    await client.connect()
    const db = client.db('gamelogue')
    const users = db.collection('User')

    const email = 'admin@gamelogue.com'
    const password = 'admin123'
    const username = 'admin'

    const existing = await users.findOne({ email })
    if (existing) {
      console.log('❌ Usuário já existe!')
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const lastUser = await users.findOne({}, { sort: { id: -1 } as any })
    const nextId = lastUser?.id ? String(Number(lastUser.id) + 1) : '1'

    const now = new Date()

    const doc = {
      id: nextId,
      email,
      passwordHash,
      username,
      bio: null,
      avatar: null,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    }

    const result = await users.insertOne(doc as any)

    console.log('✅ Usuário criado com sucesso!')
    console.log(`ID do documento: ${result.insertedId}`)
    console.log(`Email: ${email}`)
    console.log(`Senha: ${password}`)
    console.log(`Username: ${username}`)
    console.log(`ID sequencial: ${nextId}`)
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
  } finally {
    await client.close()
  }
}

createAdmin()
