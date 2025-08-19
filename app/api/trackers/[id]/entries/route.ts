import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

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

    const entries = await prisma.entry.findMany({
      where: {
        trackerId: params.id,
        userId: session.user.id as string,
      },
      include: {
        values: {
          include: {
            field: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const body = await request.json()
    const { values } = body

    // Create entry
    const entry = await prisma.entry.create({
      data: {
        trackerId: params.id,
        userId: session.user.id as string,
        values: {
          create: values.map((value: any) => {
            const field = tracker.fields.find(f => f.id === value.fieldId)
            
            if (!field) {
              throw new Error(`Field with ID ${value.fieldId} not found`)
            }
            
            const data: any = {
              fieldId: value.fieldId,
            }
            
            // Set the appropriate value based on field type
            switch (field.type) {
              case 'text':
                data.textValue = value.value
                break
              case 'number':
                data.numberValue = parseFloat(value.value)
                break
              case 'date':
                data.dateValue = new Date(value.value)
                break
              case 'toggle':
                data.boolValue = value.value === true || value.value === 'true'
                break
              case 'file':
                data.fileValue = value.value
                break
              case 'location':
                data.locationValue = value.value
                break
              default:
                data.textValue = value.value
            }
            
            return data
          }),
        },
      },
      include: {
        values: {
          include: {
            field: true,
          },
        },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

