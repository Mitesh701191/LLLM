import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trackers = await prisma.tracker.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(trackers)
  } catch (error) {
    console.error('Error fetching trackers:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, fields } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    const tracker = await prisma.tracker.create({
      data: {
        name,
        description,
        userId: session.user.id as string,
        fields: {
          create: fields || [],
        },
      },
      include: {
        fields: true,
      },
    })

    return NextResponse.json(tracker, { status: 201 })
  } catch (error) {
    console.error('Error creating tracker:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

