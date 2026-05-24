import { reservationSchema }
from '@/lib/validations'

import { createReservation }
from '@/lib/reservation'

export async function POST(request: Request) {

  try {

    const body = await request.json()

    const validatedData =
      reservationSchema.parse(body)

    const reservation =
      await createReservation(
        validatedData.productId,
        validatedData.warehouseId,
        validatedData.quantity
      )

    return Response.json(reservation)

  } catch (error: any) {

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