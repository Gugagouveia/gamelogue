# 🎮 Gamelogue

Uma plataforma estilo VSCO voltada para o público gamer. Compartilhe suas melhores capturas de tela, jogadas épicas e momentos gaming com a comunidade!

## 🚀 Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Prisma** - ORM para MongoDB
- **MongoDB** - Banco de dados NoSQL
- **Cloudinary** - Upload e hospedagem de imagens
- **React Dropzone** - Interface de upload drag & drop

## 📋 Pré-requisitos

1. **MongoDB Atlas** (ou MongoDB local)
   - Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crie um cluster e obtenha a connection string

2. **Cloudinary**
   - Crie uma conta gratuita em [Cloudinary](https://cloudinary.com)
   - Obtenha suas credenciais (Cloud Name, API Key, API Secret)

## 🔧 Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto com suas credenciais:

```env
# MongoDB Connection String
DATABASE_URL="mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster.mongodb.net/gamelogue?retryWrites=true&w=majority"

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

### 3. Gerar Prisma Client

```bash
npx prisma generate
```

### 4. (Opcional) Sync com MongoDB

Se você já tiver dados, pode fazer pull do schema:

```bash
npx prisma db pull
```

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Estrutura do Projeto

```
gamelogue/
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── upload/route.ts    # Upload de imagens
│   │   │   └── route.ts            # Listagem de posts
│   │   └── users/route.ts          # Gerenciamento de usuários
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Página principal
├── components/
│   ├── Feed.tsx                    # Feed de posts
│   └── UploadForm.tsx              # Formulário de upload
├── lib/
│   ├── cloudinary.ts               # Config Cloudinary
│   └── prisma.ts                   # Prisma Client
├── prisma/
│   └── schema.prisma               # Schema do banco
└── .env                            # Variáveis de ambiente
```

## 🗄️ Schema do Banco de Dados

### Models

- **User** - Usuários da plataforma
- **Post** - Posts com imagens
- **Like** - Curtidas nos posts
- **Comment** - Comentários nos posts

## 🎯 Features

### ✅ Implementadas

- Upload de imagens com drag & drop
- Feed de posts em grid
- Integração com MongoDB via Prisma
- Armazenamento de imagens no Cloudinary
- Tags e informações do jogo
- Paginação no feed

### 🔜 Próximas Features

- Autenticação de usuários (NextAuth)
- Sistema de likes
- Comentários
- Perfil de usuário
- Busca por tags/jogos
- Feed personalizado
- Modo escuro

## 📝 Como Usar

### Criar um Usuário (via API)

Primeiro, você precisa criar um usuário:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gamer@example.com",
    "username": "progamer123",
    "name": "Pro Gamer"
  }'
```

Copie o `id` do usuário retornado.

### Fazer Upload de um Post

1. Clique no botão **"+ Upload"** no header
2. Cole o `userId` obtido anteriormente (temporário, até implementar auth)
3. Arraste uma imagem ou clique para selecionar
4. Preencha a legenda, jogo e tags
5. Clique em **"Publicar"**

## 🔐 Nota sobre Autenticação

Por enquanto, o sistema usa `userId` manual para identificar usuários. Isso é **temporário** e será substituído por autenticação real (NextAuth/Auth.js) em breve.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📄 Licença

MIT

---

**Gamelogue** - Compartilhe suas jogadas épicas! 🎮✨
