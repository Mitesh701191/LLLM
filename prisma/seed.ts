import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log(`Created demo user: ${user.email}`)

  // Create a sample tracker
  const workoutTracker = await prisma.tracker.upsert({
    where: { id: 'workout-tracker' },
    update: {},
    create: {
      id: 'workout-tracker',
      name: 'Workout Tracker',
      description: 'Track your workouts and exercises',
      userId: user.id,
    },
  })

  console.log(`Created tracker: ${workoutTracker.name}`)

  // Create fields for the workout tracker
  const fields = [
    {
      name: 'Exercise',
      type: 'text',
      required: true,
      trackerId: workoutTracker.id,
    },
    {
      name: 'Sets',
      type: 'number',
      required: true,
      trackerId: workoutTracker.id,
    },
    {
      name: 'Reps',
      type: 'number',
      required: true,
      trackerId: workoutTracker.id,
    },
    {
      name: 'Weight (kg)',
      type: 'number',
      required: false,
      trackerId: workoutTracker.id,
    },
    {
      name: 'Completed',
      type: 'toggle',
      required: false,
      trackerId: workoutTracker.id,
    },
    {
      name: 'Notes',
      type: 'text',
      required: false,
      trackerId: workoutTracker.id,
    },
  ]

  for (const field of fields) {
    await prisma.field.create({
      data: field,
    })
  }

  console.log(`Created ${fields.length} fields for the workout tracker`)

  // Create a sample entry
  const entry = await prisma.entry.create({
    data: {
      trackerId: workoutTracker.id,
      userId: user.id,
      values: {
        create: [
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Exercise', trackerId: workoutTracker.id } }))!.id,
            textValue: 'Bench Press',
          },
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Sets', trackerId: workoutTracker.id } }))!.id,
            numberValue: 3,
          },
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Reps', trackerId: workoutTracker.id } }))!.id,
            numberValue: 10,
          },
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Weight (kg)', trackerId: workoutTracker.id } }))!.id,
            numberValue: 70,
          },
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Completed', trackerId: workoutTracker.id } }))!.id,
            boolValue: true,
          },
          {
            fieldId: (await prisma.field.findFirst({ where: { name: 'Notes', trackerId: workoutTracker.id } }))!.id,
            textValue: 'Felt good, increased weight from last session',
          },
        ],
      },
    },
  })

  console.log(`Created sample entry for the workout tracker`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

