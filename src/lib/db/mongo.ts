import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function getMongoClient() {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  client = new MongoClient(url)
  await client.connect()
  return client
}

export async function getDb(name = 'gamelogue') {
  const cli = await getMongoClient()
  return cli.db(name)
}
