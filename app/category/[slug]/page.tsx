'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import ShopProducts from '@/components/shop-products'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  if (!slug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Category not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ShopProducts initialCategory={slug} />
    </div>
  )
}
