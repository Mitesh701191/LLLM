import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tracker = await prisma.tracker.findUnique({
      where: {
        id: params.id,
      },
      include: {
        fields: true,
      },
    })

    if (!tracker) {
      return NextResponse.json(
        { message: 'Tracker not found' },
        { status: 404 }
      )
    }

    if (tracker.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(tracker)
  } catch (error) {
    console.error('Error fetching tracker:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tracker = await prisma.tracker.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!tracker) {
      return NextResponse.json(
        { message: 'Tracker not found' },
        { status: 404 }
      )
    }

    if (tracker.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    const updatedTracker = await prisma.tracker.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(updatedTracker)
  } catch (error) {
    console.error('Error updating tracker:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tracker = await prisma.tracker.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!tracker) {
      return NextResponse.json(
        { message: 'Tracker not found' },
        { status: 404 }
      )
    }

    if (tracker.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.tracker.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: 'Tracker deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting tracker:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

