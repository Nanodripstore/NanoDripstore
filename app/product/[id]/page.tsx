import { notFound } from 'next/navigation';
import { getProductById, products } from '@/lib/products';
import ProductPageClient from './product-page-client';

export async function generateStaticParams() {
  // Get all product IDs from the products array
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = parseInt(params.id);
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}