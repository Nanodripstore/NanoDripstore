import { db } from './lib/db';

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test categories
    console.log('\n--- Testing Categories API Logic ---');
    const products = await db.products.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    });
    
    console.log('Unique Categories:');
    for (const product of products) {
      console.log(`- ${product.category}`);
      
      const count = await db.products.count({
        where: { category: product.category }
      });
      
      console.log(`  Products count: ${count}`);
    }
    
    // Test product detail logic
    console.log('\n--- Testing Product Detail API Logic ---');
    const allProducts = await db.products.findMany({
      take: 3
    });
    
    if (allProducts.length > 0) {
      const testProduct = allProducts[0];
      console.log(`Product: ${testProduct.name}`);
      console.log(`Slug would be: ${testProduct.name.toLowerCase().replace(/\s+/g, '-')}`);
      
      // Get related products
      const relatedProducts = await db.products.findMany({
        where: {
          category: testProduct.category,
          id: { not: testProduct.id }
        },
        take: 2
      });
      
      console.log(`Related Products: ${relatedProducts.length}`);
      relatedProducts.forEach(p => console.log(`- ${p.name}`));
    }
    
    // Test search
    console.log('\n--- Testing Product Search API Logic ---');
    const searchResults = await db.products.findMany({
      where: {
        name: {
          contains: 'Hood',
          mode: 'insensitive'
        }
      },
      take: 5
    });
    
    console.log(`Products containing 'Hood' in name: ${searchResults.length}`);
    searchResults.forEach(p => console.log(`- ${p.name}`));
    
    console.log('\nDatabase connection and queries working correctly!');
  } catch (error) {
    console.error('Error testing database connection:');
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

main();
