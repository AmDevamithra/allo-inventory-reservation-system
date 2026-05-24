import { prisma }
from '@/lib/prisma'

import { reservationSchema }
from '@/lib/validations'

import { createReservation }
from '@/lib/reservation'

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json()

    const idempotencyKey =
      request.headers.get(
        'Idempotency-Key'
      )

    if (idempotencyKey) {

      const existingKey =
        await prisma.idempotencyKey.findUnique({

          where: {
            key: idempotencyKey
          }
        })

      if (existingKey) {

        return Response.json(
          existingKey.response
        )
      }
    }

    const validatedData =
      reservationSchema.parse(body)

    const reservation =
      await createReservation(
        validatedData.productId,
        validatedData.warehouseId,
        validatedData.quantity
      )

    if (idempotencyKey) {

      await prisma.idempotencyKey.create({

        data: {

          key: idempotencyKey,

          endpoint:
            '/api/reservations',

          response: JSON.parse(
              JSON.stringify(reservation)
            )
        }
      })
    }

    return Response.json(
      reservation
    )

  } catch (error: any) {
    console.log(error)

    if (
      error.message ===
      'INSUFFICIENT_STOCK'
    ) {

      return Response.json(
        {
          error: 'Not enough stock'
        },
        {
          status: 409
        }
      )
    }

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