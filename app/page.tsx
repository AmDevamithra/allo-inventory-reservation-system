'use client'

import { useEffect, useState } from 'react'

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

  const [products, setProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  async function fetchProducts() {

    const response =
      await fetch('/api/products')

    const data =
      await response.json()

    setProducts(data)

    setLoading(false)
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

      alert('Not enough stock')

      return
    }

    const reservation =
      await response.json()

    window.location.href =
      `/checkout/${reservation.id}`
  }

  if (loading) {
    return (
      <div className='p-10'>
        Loading...
      </div>
    )
  }

  return (

    <main className='p-10'>

      <h1 className='text-4xl font-bold mb-8'>
        Products
      </h1>

      <div className='grid gap-6'>

        {products.map((product) => (

          <div
            key={product.id}
            className='border rounded-xl p-6'
          >

            <h2 className='text-2xl font-bold'>
              {product.name}
            </h2>

            <p className='text-gray-600 mb-4'>
              {product.description}
            </p>

            <div className='space-y-4'>

              {product.inventories.map(
                (inventory) => (

                <div
                  key={inventory.warehouseId}
                  className='border p-4 rounded-lg'
                >

                  <div className='flex justify-between items-center'>

                    <div>

                      <p className='font-semibold'>
                        {inventory.warehouse}
                      </p>

                      <p>
                        Available Stock:
                        {' '}
                        {inventory.availableStock}
                      </p>

                    </div>

                    <button

                      onClick={() =>
                        reserveProduct(
                          product.id,
                          inventory.warehouseId
                        )
                      }

                      className='bg-black text-white px-4 py-2 rounded-lg'
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

    </main>
  )
}