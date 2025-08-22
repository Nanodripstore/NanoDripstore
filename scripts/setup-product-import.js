const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a sample Excel file for testing
function createSampleExcelFile() {
  const sampleData = [
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
      price: 29.99,
      category: 'clothing',
      sku: 'TSHIRT-001',
      colors: 'red, blue, green, black, white',
      sizes: 'S, M, L, XL',
      stock: 100,
      images: 'https://example.com/tshirt1.jpg, https://example.com/tshirt2.jpg',
      tags: 'casual, cotton, summer',
      type: 'clothing',
      isNew: true,
      isBestseller: false
    },
    {
      name: 'Premium Hoodie',
      description: 'Warm and cozy hoodie made from premium materials',
      price: 59.99,
      category: 'clothing',
      sku: 'HOODIE-001',
      colors: 'black, gray, navy, maroon',
      sizes: 'S, M, L, XL, XXL',
      stock: 50,
      images: 'https://example.com/hoodie1.jpg, https://example.com/hoodie2.jpg',
      tags: 'warm, winter, casual, premium',
      type: 'clothing',
      isNew: false,
      isBestseller: true
    },
    {
      name: 'Polo Shirt',
      description: 'Classic polo shirt for a smart casual look',
      price: 39.99,
      category: 'clothing',
      sku: 'POLO-001',
      colors: 'white, navy, light blue, pink',
      sizes: 'S, M, L, XL',
      stock: 75,
      images: 'https://example.com/polo1.jpg',
      tags: 'formal, casual, polo',
      type: 'clothing',
      isNew: true,
      isBestseller: false
    },
    {
      name: 'Denim Jacket',
      description: 'Stylish denim jacket for any season',
      price: 79.99,
      category: 'clothing',
      sku: 'JACKET-001',
      colors: 'blue, black, light blue',
      sizes: 'S, M, L, XL',
      stock: 30,
      images: 'https://example.com/jacket1.jpg, https://example.com/jacket2.jpg',
      tags: 'denim, jacket, stylish',
      type: 'clothing',
      isNew: false,
      isBestseller: true
    },
    {
      name: 'Tank Top',
      description: 'Lightweight tank top perfect for summer',
      price: 19.99,
      category: 'clothing',
      sku: 'TANK-001',
      colors: 'white, black, gray, red',
      sizes: 'S, M, L, XL',
      stock: 80,
      images: 'https://example.com/tank1.jpg',
      tags: 'summer, lightweight, casual',
      type: 'clothing',
      isNew: true,
      isBestseller: false
    }
  ];

  // Create Excel file
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Save the file
  const fileName = path.join(publicDir, 'sample-products.xlsx');
  XLSX.writeFile(workbook, fileName);

  console.log(`Sample Excel file created: ${fileName}`);
  console.log('You can use this file to test the import functionality.');
  
  return fileName;
}

// Create CSV version as well
function createSampleCSVFile() {
  const sampleData = [
    'name,description,price,category,sku,colors,sizes,stock,images,tags,type,isNew,isBestseller',
    'Cotton T-Shirt,Comfortable 100% cotton t-shirt perfect for everyday wear,29.99,clothing,TSHIRT-001,"red, blue, green, black, white","S, M, L, XL",100,"https://example.com/tshirt1.jpg, https://example.com/tshirt2.jpg","casual, cotton, summer",clothing,true,false',
    'Premium Hoodie,Warm and cozy hoodie made from premium materials,59.99,clothing,HOODIE-001,"black, gray, navy, maroon","S, M, L, XL, XXL",50,"https://example.com/hoodie1.jpg, https://example.com/hoodie2.jpg","warm, winter, casual, premium",clothing,false,true',
    'Polo Shirt,Classic polo shirt for a smart casual look,39.99,clothing,POLO-001,"white, navy, light blue, pink","S, M, L, XL",75,https://example.com/polo1.jpg,"formal, casual, polo",clothing,true,false',
    'Denim Jacket,Stylish denim jacket for any season,79.99,clothing,JACKET-001,"blue, black, light blue","S, M, L, XL",30,"https://example.com/jacket1.jpg, https://example.com/jacket2.jpg","denim, jacket, stylish",clothing,false,true',
    'Tank Top,Lightweight tank top perfect for summer,19.99,clothing,TANK-001,"white, black, gray, red","S, M, L, XL",80,https://example.com/tank1.jpg,"summer, lightweight, casual",clothing,true,false'
  ];

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const fileName = path.join(publicDir, 'sample-products.csv');
  fs.writeFileSync(fileName, sampleData.join('\n'));

  console.log(`Sample CSV file created: ${fileName}`);
  return fileName;
}

// Test database connection and schema
async function testDatabaseConnection() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    console.log('Testing database connection...');
    
    // Test products table
    const productCount = await prisma.products.count();
    console.log(`✅ Products table accessible. Current count: ${productCount}`);

    // Test product_variants table
    const variantCount = await prisma.product_variants.count();
    console.log(`✅ Product variants table accessible. Current count: ${variantCount}`);

    await prisma.$disconnect();
    console.log('✅ Database connection test successful');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.log('Make sure your DATABASE_URL is correctly set in .env.local');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Setting up NanoDripstore Product Import Test Environment\n');

  console.log('1. Creating sample files...');
  createSampleExcelFile();
  createSampleCSVFile();
  console.log('');

  console.log('2. Testing database connection...');
  await testDatabaseConnection();
  console.log('');

  console.log('3. Next steps:');
  console.log('   - Start your development server: npm run dev');
  console.log('   - Go to http://localhost:3000/admin');
  console.log('   - Click on "Import Products"');
  console.log('   - Test file upload with public/sample-products.xlsx');
  console.log('   - Set up Google Sheets API following GOOGLE_SHEETS_SETUP.md');
  console.log('');
  
  console.log('📋 Google Sheets Test Template:');
  console.log('   Create a Google Sheet with these column headers:');
  console.log('   name | description | price | category | sku | colors | sizes | stock | images | tags | type | isNew | isBestseller');
  console.log('');
  console.log('   Example data row:');
  console.log('   Cotton T-Shirt | Comfortable cotton t-shirt | 29.99 | clothing | TSHIRT-001 | red, blue, green | S, M, L, XL | 100 | https://example.com/image.jpg | casual, cotton | clothing | true | false');
  console.log('');
  
  console.log('✅ Test environment setup complete!');
}

// Run the tests
runTests().catch(console.error);
