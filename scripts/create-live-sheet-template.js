const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a comprehensive Google Sheets template for live product sync
function createLiveSheetTemplate() {
  // Headers for the live sheet
  const headers = [
    'product_id',
    'name', 
    'description',
    'category',
    'type',
    'base_price',
    'color_name',
    'color_hex',
    'size',
    'variant_sku',
    'variant_price',
    'stock_quantity',
    'image_url_1',
    'image_url_2', 
    'image_url_3',
    'tags',
    'is_new',
    'is_bestseller',
    'is_active',
    'created_date',
    'last_updated'
  ];

  // Sample data for the live sheet (multiple variants per product)
  const sampleData = [
    // Product 1: Cotton T-Shirt variants
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Red', '#FF0000', 'S', 'TSHIRT-001-RED-S', 29.99, 25, 'https://example.com/tshirt-red-1.jpg', 'https://example.com/tshirt-red-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Red', '#FF0000', 'M', 'TSHIRT-001-RED-M', 29.99, 50, 'https://example.com/tshirt-red-1.jpg', 'https://example.com/tshirt-red-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Red', '#FF0000', 'L', 'TSHIRT-001-RED-L', 29.99, 75, 'https://example.com/tshirt-red-1.jpg', 'https://example.com/tshirt-red-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Blue', '#0000FF', 'S', 'TSHIRT-001-BLU-S', 29.99, 30, 'https://example.com/tshirt-blue-1.jpg', 'https://example.com/tshirt-blue-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Blue', '#0000FF', 'M', 'TSHIRT-001-BLU-M', 29.99, 60, 'https://example.com/tshirt-blue-1.jpg', 'https://example.com/tshirt-blue-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['TSHIRT-001', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for everyday wear', 'clothing', 't-shirt', 29.99, 'Blue', '#0000FF', 'L', 'TSHIRT-001-BLU-L', 29.99, 40, 'https://example.com/tshirt-blue-1.jpg', 'https://example.com/tshirt-blue-2.jpg', '', 'casual,cotton,summer', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    
    // Product 2: Premium Hoodie variants
    ['HOODIE-001', 'Premium Hoodie', 'Warm and cozy hoodie made from premium materials', 'clothing', 'hoodie', 59.99, 'Black', '#000000', 'M', 'HOODIE-001-BLA-M', 59.99, 20, 'https://example.com/hoodie-black-1.jpg', 'https://example.com/hoodie-black-2.jpg', 'https://example.com/hoodie-black-3.jpg', 'warm,winter,premium', 'FALSE', 'TRUE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['HOODIE-001', 'Premium Hoodie', 'Warm and cozy hoodie made from premium materials', 'clothing', 'hoodie', 59.99, 'Black', '#000000', 'L', 'HOODIE-001-BLA-L', 59.99, 35, 'https://example.com/hoodie-black-1.jpg', 'https://example.com/hoodie-black-2.jpg', 'https://example.com/hoodie-black-3.jpg', 'warm,winter,premium', 'FALSE', 'TRUE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['HOODIE-001', 'Premium Hoodie', 'Warm and cozy hoodie made from premium materials', 'clothing', 'hoodie', 59.99, 'Black', '#000000', 'XL', 'HOODIE-001-BLA-XL', 59.99, 15, 'https://example.com/hoodie-black-1.jpg', 'https://example.com/hoodie-black-2.jpg', 'https://example.com/hoodie-black-3.jpg', 'warm,winter,premium', 'FALSE', 'TRUE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['HOODIE-001', 'Premium Hoodie', 'Warm and cozy hoodie made from premium materials', 'clothing', 'hoodie', 59.99, 'Gray', '#808080', 'M', 'HOODIE-001-GRA-M', 59.99, 25, 'https://example.com/hoodie-gray-1.jpg', 'https://example.com/hoodie-gray-2.jpg', '', 'warm,winter,premium', 'FALSE', 'TRUE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['HOODIE-001', 'Premium Hoodie', 'Warm and cozy hoodie made from premium materials', 'clothing', 'hoodie', 59.99, 'Gray', '#808080', 'L', 'HOODIE-001-GRA-L', 59.99, 30, 'https://example.com/hoodie-gray-1.jpg', 'https://example.com/hoodie-gray-2.jpg', '', 'warm,winter,premium', 'FALSE', 'TRUE', 'TRUE', '2025-08-20', '2025-08-20'],
    
    // Product 3: Polo Shirt variants
    ['POLO-001', 'Classic Polo Shirt', 'Smart casual polo shirt for any occasion', 'clothing', 'polo', 39.99, 'White', '#FFFFFF', 'M', 'POLO-001-WHI-M', 39.99, 40, 'https://example.com/polo-white-1.jpg', '', '', 'formal,casual,polo', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['POLO-001', 'Classic Polo Shirt', 'Smart casual polo shirt for any occasion', 'clothing', 'polo', 39.99, 'White', '#FFFFFF', 'L', 'POLO-001-WHI-L', 39.99, 35, 'https://example.com/polo-white-1.jpg', '', '', 'formal,casual,polo', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['POLO-001', 'Classic Polo Shirt', 'Smart casual polo shirt for any occasion', 'clothing', 'polo', 39.99, 'Navy', '#000080', 'M', 'POLO-001-NAV-M', 39.99, 50, 'https://example.com/polo-navy-1.jpg', '', '', 'formal,casual,polo', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20'],
    ['POLO-001', 'Classic Polo Shirt', 'Smart casual polo shirt for any occasion', 'clothing', 'polo', 39.99, 'Navy', '#000080', 'L', 'POLO-001-NAV-L', 39.99, 45, 'https://example.com/polo-navy-1.jpg', '', '', 'formal,casual,polo', 'TRUE', 'FALSE', 'TRUE', '2025-08-20', '2025-08-20']
  ];

  // Create Excel workbook
  const workbook = XLSX.utils.book_new();
  
  // Create main sheet with headers and data
  const worksheetData = [headers, ...sampleData];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 12 }, // product_id
    { wch: 20 }, // name
    { wch: 30 }, // description
    { wch: 12 }, // category
    { wch: 10 }, // type
    { wch: 10 }, // base_price
    { wch: 12 }, // color_name
    { wch: 10 }, // color_hex
    { wch: 8 },  // size
    { wch: 18 }, // variant_sku
    { wch: 12 }, // variant_price
    { wch: 12 }, // stock_quantity
    { wch: 25 }, // image_url_1
    { wch: 25 }, // image_url_2
    { wch: 25 }, // image_url_3
    { wch: 15 }, // tags
    { wch: 8 },  // is_new
    { wch: 12 }, // is_bestseller
    { wch: 8 },  // is_active
    { wch: 12 }, // created_date
    { wch: 12 }  // last_updated
  ];
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  // Create instructions sheet
  const instructions = [
    ['NanoDripstore Live Product Database Instructions'],
    [''],
    ['How to use this sheet:'],
    [''],
    ['1. Each row represents ONE product variant (specific color + size combination)'],
    ['2. Products with multiple colors and sizes need multiple rows'],
    ['3. Keep the same product_id for all variants of the same product'],
    ['4. The system will automatically generate missing variant_sku and color_hex values'],
    [''],
    ['Column Descriptions:'],
    [''],
    ['product_id: Unique identifier for the base product (e.g., TSHIRT-001)'],
    ['name: Product name (same for all variants)'],
    ['description: Product description (same for all variants)'],
    ['category: Product category (clothing, accessories, etc.)'],
    ['type: Specific product type (t-shirt, hoodie, etc.)'],
    ['base_price: Base price for the product'],
    ['color_name: Color variant name (Red, Blue, etc.)'],
    ['color_hex: Hex color code (auto-generated if empty)'],
    ['size: Size variant (S, M, L, XL, etc.)'],
    ['variant_sku: Unique SKU for this specific variant (auto-generated if empty)'],
    ['variant_price: Price for this variant (uses base_price if empty)'],
    ['stock_quantity: Available stock for this variant'],
    ['image_url_1: Primary product image URL'],
    ['image_url_2: Secondary product image URL (optional)'],
    ['image_url_3: Third product image URL (optional)'],
    ['tags: Comma-separated tags (casual,summer,cotton)'],
    ['is_new: TRUE/FALSE - is this a new product?'],
    ['is_bestseller: TRUE/FALSE - is this a bestseller?'],
    ['is_active: TRUE/FALSE - is this product active?'],
    ['created_date: Creation date (YYYY-MM-DD)'],
    ['last_updated: Last update date (auto-updated by system)'],
    [''],
    ['Example: T-shirt with 2 colors and 3 sizes = 6 rows total'],
    ['Row 1: TSHIRT-001, Cotton T-Shirt, ..., Red, #FF0000, S, TSHIRT-001-RED-S, ...'],
    ['Row 2: TSHIRT-001, Cotton T-Shirt, ..., Red, #FF0000, M, TSHIRT-001-RED-M, ...'],
    ['Row 3: TSHIRT-001, Cotton T-Shirt, ..., Red, #FF0000, L, TSHIRT-001-RED-L, ...'],
    ['Row 4: TSHIRT-001, Cotton T-Shirt, ..., Blue, #0000FF, S, TSHIRT-001-BLU-S, ...'],
    ['Row 5: TSHIRT-001, Cotton T-Shirt, ..., Blue, #0000FF, M, TSHIRT-001-BLU-M, ...'],
    ['Row 6: TSHIRT-001, Cotton T-Shirt, ..., Blue, #0000FF, L, TSHIRT-001-BLU-L, ...'],
    [''],
    ['Important Notes:'],
    ['- Do not modify the header row (row 1)'],
    ['- Each variant needs its own row'],
    ['- The website will sync every few minutes automatically'],
    ['- You can trigger manual sync from the admin panel'],
    ['- Make sure to share this sheet with your service account email']
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Save the file
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  const fileName = path.join(publicDir, 'live-product-database-template.xlsx');
  XLSX.writeFile(workbook, fileName);
  
  console.log(`✅ Live sheet template created: ${fileName}`);
  console.log('📋 Upload this to Google Sheets or use it as a reference for your live database');
  
  return fileName;
}

// Generate CSV version for easier Google Sheets import
function createCSVTemplate() {
  const headers = [
    'product_id', 'name', 'description', 'category', 'type', 'base_price',
    'color_name', 'color_hex', 'size', 'variant_sku', 'variant_price', 'stock_quantity',
    'image_url_1', 'image_url_2', 'image_url_3', 'tags', 'is_new', 'is_bestseller', 'is_active',
    'created_date', 'last_updated'
  ].join(',');

  const sampleRows = [
    'TSHIRT-001,"Cotton T-Shirt","Comfortable 100% cotton t-shirt",clothing,t-shirt,29.99,Red,#FF0000,S,TSHIRT-001-RED-S,29.99,25,"https://example.com/img1.jpg","","","casual,cotton",TRUE,FALSE,TRUE,2025-08-20,2025-08-20',
    'TSHIRT-001,"Cotton T-Shirt","Comfortable 100% cotton t-shirt",clothing,t-shirt,29.99,Red,#FF0000,M,TSHIRT-001-RED-M,29.99,50,"https://example.com/img1.jpg","","","casual,cotton",TRUE,FALSE,TRUE,2025-08-20,2025-08-20',
    'TSHIRT-001,"Cotton T-Shirt","Comfortable 100% cotton t-shirt",clothing,t-shirt,29.99,Blue,#0000FF,S,TSHIRT-001-BLU-S,29.99,30,"https://example.com/img1.jpg","","","casual,cotton",TRUE,FALSE,TRUE,2025-08-20,2025-08-20'
  ];

  const csvContent = [headers, ...sampleRows].join('\n');
  
  const publicDir = path.join(__dirname, '../public');
  const fileName = path.join(publicDir, 'live-product-database-template.csv');
  fs.writeFileSync(fileName, csvContent);
  
  console.log(`✅ CSV template created: ${fileName}`);
  return fileName;
}

// Main execution
console.log('🚀 Creating Live Product Database Templates...\n');

createLiveSheetTemplate();
createCSVTemplate();

console.log('\n📊 Template Creation Complete!');
console.log('\nNext Steps:');
console.log('1. Upload the Excel file to Google Sheets');
console.log('2. Share the sheet with your service account email');
console.log('3. Copy the spreadsheet ID from the URL');
console.log('4. Add the spreadsheet ID to your .env.local as LIVE_SHEET_ID');
console.log('5. Start adding your products using the template structure');
console.log('6. Use the admin panel to sync products automatically');
console.log('\n🎉 Your live product database is ready!');
