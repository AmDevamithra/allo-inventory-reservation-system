'use client'

import React, {
  useEffect,
  useState
} from 'react'

type Reservation = {
  id: string
  status: string
  expiresAt: string

  product: {
    name: string
  }

  warehouse: {
    name: string
  }
}

export default function CheckoutPage({
  params
}: {
  params: Promise<{
    id: string
  }>
}) {

  const resolvedParams =
    React.use(params)

  const [reservation, setReservation] =
    useState<Reservation | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [timeLeft, setTimeLeft] =
    useState('')

  async function fetchReservation() {

    const response =
      await fetch(
        `/api/reservations/${resolvedParams.id}`
      )

    const data =
      await response.json()

    setReservation(data)

    setLoading(false)
  }

  useEffect(() => {
    fetchReservation()
  }, [])

  useEffect(() => {

    if (!reservation) return

    const interval =
      setInterval(() => {

        const now =
          new Date().getTime()

        const expiry =
          new Date(
            reservation.expiresAt
          ).getTime()

        const distance =
          expiry - now

        if (distance <= 0) {

          setTimeLeft('Expired')

          clearInterval(interval)

          return
        }

        const minutes =
          Math.floor(
            distance / 1000 / 60
          )

        const seconds =
          Math.floor(
            (distance / 1000) % 60
          )

        setTimeLeft(
          `${minutes}m ${seconds}s`
        )

      }, 1000)

    return () =>
      clearInterval(interval)

  }, [reservation])

  async function confirmPurchase() {

    const response =
      await fetch(
        `/api/reservations/${resolvedParams.id}/confirm`,
        {
          method: 'POST'
        }
      )

    if (response.status === 410) {

      alert('Reservation expired')

      return
    }

    alert('Purchase confirmed')

    fetchReservation()
  }

  async function cancelReservation() {

    await fetch(
      `/api/reservations/${resolvedParams.id}/release`,
      {
        method: 'POST'
      }
    )

    alert('Reservation cancelled')

    fetchReservation()
  }

  if (loading) {

    return (
      <div className='p-10'>
        Loading...
      </div>
    )
  }

  if (!reservation) {

    return (
      <div className='p-10'>
        Reservation not found
      </div>
    )
  }

  return (

    <main className='p-10'>

      <div className='max-w-xl border rounded-xl p-6'>

        <h1 className='text-3xl font-bold mb-6'>
          Checkout
        </h1>

        <div className='space-y-4'>

          <p>
            <strong>Product:</strong>
            {' '}
            {reservation.product.name}
          </p>

          <p>
            <strong>Warehouse:</strong>
            {' '}
            {reservation.warehouse.name}
          </p>

          <p>
            <strong>Status:</strong>
            {' '}
            {reservation.status}
          </p>

          <p className='text-red-500 font-bold'>
            Expires In:
            {' '}
            {timeLeft}
          </p>

          <div className='flex gap-4 pt-4'>

            <button
              onClick={confirmPurchase}
              className='bg-green-600 text-white px-4 py-2 rounded-lg'
            >
              Confirm Purchase
            </button>

            <button
              onClick={cancelReservation}
              className='bg-red-600 text-white px-4 py-2 rounded-lg'
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}