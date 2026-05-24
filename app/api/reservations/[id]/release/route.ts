import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {

  const params =
    await context.params

  try {

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: params.id
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

    if (
      reservation.status !== 'PENDING'
    ) {

      return Response.json(
        {
          error: 'Reservation invalid'
        },
        {
          status: 400
        }
      )
    }

    await prisma.$transaction(async (tx) => {

      const inventory =
        await tx.inventory.findFirst({
          where: {
            productId:
              reservation.productId,

            warehouseId:
              reservation.warehouseId
          }
        })

      if (!inventory) {
        throw new Error(
          'Inventory not found'
        )
      }

      await tx.inventory.update({
        where: {
          id: inventory.id
        },

        data: {

          reservedStock: {
            decrement:
              reservation.quantity
          }
        }
      })

      await tx.reservation.update({
        where: {
          id: reservation.id
        },

        data: {
          status: 'RELEASED'
        }
      })
    })

    return Response.json({
      success: true
    })

  } catch {

    return Response.json(
      {
        error: 'Something went wrong'
      },
      {
        status: 500
      }
    )
  }
}