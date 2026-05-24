'use client'

import {
  useEffect,
  useState
} from 'react'

import { toast } from 'sonner'

import {
  useRouter
} from 'next/navigation'

type Inventory = {
  warehouseId: string
  warehouse: string
  totalStock: number
  reservedStock: number
  availableStock: number
}

type Product = {
  id: string
  name: string
  description: string
  inventories: Inventory[]
}

export default function HomePage() {

  const router =
    useRouter()

  const [products, setProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  async function fetchProducts() {

    try {

      const response =
        await fetch('/api/products', {
          cache: 'no-store'
        })

      if (!response.ok) {

        throw new Error(
          'Failed to fetch products'
        )
      }

      const data =
        await response.json()

      setProducts(data)

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to load products'
      )

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    const response =
      await fetch('/api/reservations', {

        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1
        })
      })

    if (response.status === 409) {

      toast.error(
        'Not enough stock available'
      )

      return
    }

    toast.success(
      'Reservation created'
    )

    const reservation =
      await response.json()

    router.push(
      `/checkout/${reservation.id}`
    )
  }

  if (loading) {

    return (

      <div className='min-h-screen flex items-center justify-center'>

        <div className='text-xl font-semibold text-gray-600'>
          Loading products...
        </div>

      </div>
    )
  }

  return (

    <main className='min-h-screen bg-gray-100 p-10'>

      <div className='max-w-7xl mx-auto'>

        <div className='mb-12'>

          <h1 className='text-5xl font-bold text-gray-900'>
            Allo Inventory System
          </h1>

          <p className='text-gray-600 text-lg mt-3'>
            Real-time multi-warehouse inventory reservation platform
          </p>

        </div>

        <div className='grid md:grid-cols-2 gap-8'>

          {products.map((product) => (

            <div
              key={product.id}
              className='bg-white rounded-3xl border shadow-sm hover:shadow-2xl transition-all duration-300 p-7'
            >

              <div className='mb-6'>

                <h2 className='text-3xl font-bold text-gray-900'>
                  {product.name}
                </h2>

                <p className='text-gray-600 mt-2'>
                  {product.description}
                </p>

              </div>

              <div className='space-y-5'>

                {product.inventories.map(
                  (inventory) => (

                  <div
                    key={inventory.warehouseId}
                    className='bg-gray-50 border rounded-2xl p-5'
                  >

                    <div className='flex justify-between items-center gap-4'>

                      <div className='flex-1'>

                        <div className='flex items-center gap-2 mb-3'>

                          <div className='w-3 h-3 rounded-full bg-green-500' />

                          <p className='text-lg font-semibold text-gray-800'>
                            {inventory.warehouse}
                          </p>

                        </div>

                        <div className='flex flex-wrap gap-4 text-sm'>

                          <div className='bg-white border px-3 py-1 rounded-full text-gray-700'>
                            Total:
                            {' '}
                            <span className='font-semibold'>
                              {inventory.totalStock}
                            </span>
                          </div>

                          <div className='bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full'>
                            Reserved:
                            {' '}
                            <span className='font-semibold'>
                              {inventory.reservedStock}
                            </span>
                          </div>

                          <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full'>
                            Available:
                            {' '}
                            <span className='font-semibold'>
                              {inventory.availableStock}
                            </span>
                          </div>

                        </div>

                      </div>

                      <button

                        onClick={() =>
                          reserveProduct(
                            product.id,
                            inventory.warehouseId
                          )
                        }

                        className='bg-black hover:bg-gray-800 transition-all text-white px-5 py-3 rounded-2xl font-medium shadow-sm'
                      >
                        Reserve
                      </button>

                    </div>

                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

      </div>

    </main>
  )
}