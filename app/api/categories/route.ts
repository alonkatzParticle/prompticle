import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })

    // Get prompt counts for each category
    const counts = await prisma.prompt.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    const countMap = new Map(counts.map((c) => [c.category, c._count.id]))

    const result = categories.map((cat) => ({
      ...cat,
      promptCount: countMap.get(cat.name) || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, icon } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6366f1',
        icon: icon || 'folder',
      },
    })

    return NextResponse.json({ ...category, promptCount: 0 })
  } catch (error) {
    console.error('POST /api/categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
