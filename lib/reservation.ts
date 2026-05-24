import { prisma } from './prisma'

export async function createReservation(
  productId: string,
  warehouseId: string,
  quantity: number
) {

  return prisma.$transaction(async (tx) => {

    const inventory = await tx.inventory.findFirst({
      where: {
        productId,
        warehouseId
      }
    })

    if (!inventory) {
      throw new Error('INVENTORY_NOT_FOUND')
    }

    const availableStock =
      inventory.totalStock -
      inventory.reservedStock

    if (availableStock < quantity) {
      throw new Error('INSUFFICIENT_STOCK')
    }

    await tx.inventory.update({
      where: {
        id: inventory.id
      },
      data: {
        reservedStock: {
          increment: quantity
        }
      }
    })

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    )

    const reservation =
      await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: 'PENDING'
        }
      })

    return reservation
  })
}