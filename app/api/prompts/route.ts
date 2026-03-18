import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const model = searchParams.get('model') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const sortBy = searchParams.get('sortBy') || 'date_desc'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const favoritesOnly = searchParams.get('favoritesOnly') === 'true'

    const where: Prisma.PromptWhereInput = {}

    if (search) {
      where.prompt = {
        contains: search,
      }
    }

    if (category) {
      const cats = category.split(',').filter(Boolean)
      if (cats.length > 0) {
        where.category = { in: cats }
      }
    }

    if (model) {
      const models = model.split(',').filter(Boolean)
      if (models.length > 0) {
        where.model = { in: models }
      }
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        (where.date as Prisma.DateTimeFilter).gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setDate(endDate.getDate() + 1)
        ;(where.date as Prisma.DateTimeFilter).lt = endDate
      }
    }

    if (favoritesOnly) {
      where.isFavorite = true
    }

    let orderBy: Prisma.PromptOrderByWithRelationInput = {}
    if (sortBy === 'date_asc') {
      orderBy = { date: 'asc' }
    } else if (sortBy === 'created_desc') {
      orderBy = { createdAt: 'desc' }
    } else {
      orderBy = { date: 'desc' }
    }

    const skip = (page - 1) * limit

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.prompt.count({ where }),
    ])

    const parsedPrompts = prompts.map((p) => ({
      ...p,
      tags: (() => {
        try {
          return JSON.parse(p.tags)
        } catch {
          return []
        }
      })(),
      date: p.date.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      prompts: parsedPrompts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('GET /api/prompts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, date, model, category, tags } = body

    if (!prompt || !model || !category) {
      return NextResponse.json(
        { error: 'prompt, model, and category are required' },
        { status: 400 }
      )
    }

    const newPrompt = await prisma.prompt.create({
      data: {
        prompt,
        date: date ? new Date(date) : new Date(),
        model,
        category,
        tags: JSON.stringify(tags || []),
      },
    })

    return NextResponse.json({
      ...newPrompt,
      tags: JSON.parse(newPrompt.tags),
      date: newPrompt.date.toISOString(),
      createdAt: newPrompt.createdAt.toISOString(),
      updatedAt: newPrompt.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('POST /api/prompts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
