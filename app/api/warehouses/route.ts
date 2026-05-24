import { prisma } from '@/lib/prisma'

export async function GET() {

  try {

    const warehouses =
      await prisma.warehouse.findMany()

    return Response.json(
      warehouses
    )

  } catch (error) {

    console.error(error)

    return Response.json(
      {
        error:
          'Failed to fetch warehouses'
      },
      {
        status: 500
      }
    )
  }
}