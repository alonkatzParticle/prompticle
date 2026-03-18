import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface BulkPromptInput {
  prompt: string
  date?: string
  model: string
  category: string
  tags?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Expected an array of prompts' },
        { status: 400 }
      )
    }

    const prompts: BulkPromptInput[] = body
    let created = 0
    const errors: string[] = []

    for (const p of prompts) {
      if (!p.prompt || !p.model || !p.category) {
        errors.push(`Skipped prompt missing required fields: ${JSON.stringify(p).slice(0, 50)}`)
        continue
      }
      try {
        await prisma.prompt.create({
          data: {
            prompt: p.prompt,
            date: p.date ? new Date(p.date) : new Date(),
            model: p.model,
            category: p.category,
            tags: JSON.stringify(p.tags || []),
          },
        })
        created++
      } catch (err) {
        errors.push(`Failed to create prompt: ${err}`)
      }
    }

    return NextResponse.json({ created, errors })
  } catch (error) {
    console.error('POST /api/prompts/bulk error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
