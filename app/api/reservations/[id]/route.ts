import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {

  const params =
    await context.params

  const reservation =
    await prisma.reservation.findUnique({

      where: {
        id: params.id
      },

      include: {
        product: true,
        warehouse: true
      }
    })

  if (!reservation) {

    return Response.json(
      {
        error: 'Reservation not found'
      },
      {
        status: 404
      }
    )
  }

  return Response.json(
    reservation
  )
}