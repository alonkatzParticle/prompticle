import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const categoryColors: Record<string, string> = {
  'age-edit': '#f59e0b',
  'beauty-editorial': '#ec4899',
  'edit': '#8b5cf6',
  'ethnicity-change': '#06b6d4',
  'eye-treatment': '#10b981',
  'identity-swap': '#f97316',
  'lips': '#ef4444',
  'other': '#6b7280',
  'product-photography': '#3b82f6',
  'product-swap': '#14b8a6',
  'structured-prompt': '#a855f7',
  'ugc': '#84cc16',
}

interface PromptData {
  id: number
  date: string
  model: string
  category: string
  prompt: string
  tags: string[]
}

async function main() {
  console.log('Starting seed...')

  // Read prompts.json - look in parent directory from prisma folder
  const promptsPath = path.join(__dirname, '..', 'prompts.json')
  const promptsData: PromptData[] = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'))

  // Get unique categories
  const categorySet = new Set(promptsData.map(p => p.category))
  const categories = Array.from(categorySet)

  // Seed categories
  console.log('Seeding categories...')
  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        color: categoryColors[categoryName] || '#6366f1',
        icon: 'folder',
      },
    })
  }
  console.log(`Seeded ${categories.length} categories`)

  // Check if prompts already exist
  const existingCount = await prisma.prompt.count()
  if (existingCount >= promptsData.length) {
    console.log(`Prompts already seeded (${existingCount} existing). Skipping.`)
    return
  }

  // Seed prompts
  console.log('Seeding prompts...')
  let created = 0
  for (const p of promptsData) {
    await prisma.prompt.create({
      data: {
        prompt: p.prompt,
        date: new Date(p.date),
        model: p.model,
        category: p.category,
        tags: JSON.stringify(p.tags || []),
        isFavorite: false,
      },
    })
    created++
  }
  console.log(`Seeded ${created} prompts`)
  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
