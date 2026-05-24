'use client'

import React, {
  useEffect,
  useState
} from 'react'

import { toast } from 'sonner'

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

  const [dangerTimer, setDangerTimer] =
    useState(false)

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

          setDangerTimer(true)

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

        if (distance < 30000) {
          setDangerTimer(true)
        }

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

      toast.error(
        'Reservation expired'
      )

      return
    }

    toast.success(
      'Purchase confirmed'
    )

    fetchReservation()
  }

  async function cancelReservation() {

  await fetch(
    `/api/reservations/${resolvedParams.id}/release`,
    {
      method: 'POST'
    }
  )

  toast.success(
    'Reservation cancelled'
  )

  fetchReservation()
}

  function getStatusColor() {

    switch (reservation?.status) {

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'

      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'

      case 'RELEASED':
        return 'bg-gray-200 text-gray-800'

      case 'EXPIRED':
        return 'bg-red-100 text-red-800'

      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {

    return (

      <div className='min-h-screen flex items-center justify-center'>

        <div className='text-xl font-semibold text-gray-600'>
          Loading reservation...
        </div>

      </div>
    )
  }

  if (!reservation) {

    return (

      <div className='min-h-screen flex items-center justify-center'>

        <div className='text-xl font-semibold text-red-600'>
          Reservation not found
        </div>

      </div>
    )
  }

  return (

    <main className='min-h-screen bg-gray-100 flex items-center justify-center p-8'>

      <div className='bg-white rounded-3xl shadow-2xl border p-10 max-w-2xl w-full'>

        <div className='mb-8'>

          <h1 className='text-5xl font-bold text-gray-900'>
            Checkout
          </h1>

          <p className='text-gray-600 mt-2 text-lg'>
            Complete your reservation before expiry
          </p>

        </div>

        <div className='space-y-6'>

          <div className='bg-gray-50 border rounded-2xl p-5'>

            <p className='text-sm text-gray-500 mb-1'>
              Product
            </p>

            <p className='text-2xl font-bold text-gray-900'>
              {reservation.product.name}
            </p>

          </div>

          <div className='bg-gray-50 border rounded-2xl p-5'>

            <p className='text-sm text-gray-500 mb-1'>
              Warehouse
            </p>

            <p className='text-xl font-semibold text-gray-800'>
              {reservation.warehouse.name}
            </p>

          </div>

          <div className='flex items-center justify-between gap-4'>

            <div>

              <p className='text-sm text-gray-500 mb-2'>
                Reservation Status
              </p>

              <div
                className={`inline-flex px-4 py-2 rounded-full font-semibold ${getStatusColor()}`}
              >
                {reservation.status}
              </div>

            </div>

            <div className='text-right'>

              <p className='text-sm text-gray-500 mb-2'>
                Time Remaining
              </p>

              <div
                className={`text-3xl font-bold ${
                  dangerTimer
                    ? 'text-red-600 animate-pulse'
                    : 'text-green-600'
                }`}
              >
                {timeLeft}
              </div>

            </div>

          </div>

          <div className='flex flex-col md:flex-row gap-4 pt-6'>

            <button

              onClick={confirmPurchase}

              disabled={
                reservation.status !==
                'PENDING'
              }

              className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all text-white py-4 rounded-2xl font-semibold text-lg shadow-md'
            >
              Confirm Purchase
            </button>

            <button

              onClick={cancelReservation}

              disabled={
                reservation.status !==
                'PENDING'
              }

              className='flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-all text-white py-4 rounded-2xl font-semibold text-lg shadow-md'
            >
              Cancel Reservation
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}