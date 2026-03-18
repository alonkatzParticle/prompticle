# Prompticle

A full-stack prompt library web application built with Next.js 14, Prisma, SQLite, and Tailwind CSS.

## Features

- Browse, search, and filter 283+ prompts
- Dark mode UI with category color coding
- Favorites system with star toggle
- Bulk JSON import
- Responsive layout with sidebar navigation
- Grid and list view modes
- RTL support for Hebrew/Arabic text

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS
- **UI**: Radix UI primitives, Lucide icons
- **Notifications**: Sonner toast

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Seed the database with sample prompts:
   ```bash
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

The `.env` file is pre-configured with:
```
DATABASE_URL="file:./dev.db"
```

## Docker

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

The SQLite database is persisted via a volume mount at `./prisma/dev.db`.

### Build Docker image manually:

```bash
docker build -t prompticle .
docker run -p 3000:3000 prompticle
```

## Vercel Deployment

1. Push to GitHub
2. Import the repo in Vercel
3. Vercel will use `vercel.json` to run migrations and build automatically

**Note**: SQLite is not ideal for serverless deployments. Consider switching to PostgreSQL (via PlanetScale, Neon, or Supabase) for production Vercel deployments.

## Database Management

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset

# View schema
npx prisma format
```

## Project Structure

```
prompticle/
├── app/
│   ├── api/
│   │   ├── prompts/         # Prompts CRUD API
│   │   └── categories/      # Categories API
│   ├── add/                 # Add prompt page
│   ├── categories/          # Categories management page
│   ├── favorites/           # Favorites page
│   ├── globals.css
│   ├── layout.tsx           # Root layout with sidebar
│   └── page.tsx             # Main library page
├── components/
│   ├── filter-sidebar.tsx   # Filter panel
│   ├── prompt-card.tsx      # Prompt card component
│   ├── prompt-modal.tsx     # Prompt detail modal
│   └── search-bar.tsx       # Search input
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   └── utils.ts             # Utility functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
└── prompts.json             # Source data (283 prompts)
```
