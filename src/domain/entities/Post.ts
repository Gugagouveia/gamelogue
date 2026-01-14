export interface Post {
  _id: string
  userId: string
  imageUrl: string
  publicId?: string | null
  title: string
  description: string
  game?: string
  tags: string[]
  isPublic?: boolean
  likes?: string[]
  comments?: Array<{
    userId: string
    username?: string
    text: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostInput {
  userId: string
  imageUrl: string
  publicId?: string | null
  title: string
  description: string
  game?: string
  tags?: string[]
  isPublic?: boolean
}

export interface PostWithUser extends Post {
  user: {
    _id: string
    username: string
    avatar?: string
  } | null
  likesCount: number
  commentsCount: number
}
