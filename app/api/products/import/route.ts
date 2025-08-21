import { google } from 'googleapis';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for product data from sheets
interface ProductData {
  name: string;
  description?: string;
  price: number;
  category: string;
  sku?: string;
  colors?: string;
  sizes?: string;
  stock?: number;
  images?: string;
  tags?: string;
  type?: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

// Interface for processed variant data
interface VariantData {
  colorName: string;
  colorValue: string;
  sku: string;
  price?: number;
  stockQuantity: number;
}

class GoogleSheetsService {
  private auth: any;
  private sheets: any;

  constructor() {
    // Initialize Google Auth with service account
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async readSheet(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values;
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }
}

class ProductImportService {
  private sheetsService: GoogleSheetsService;

  constructor() {
    this.sheetsService = new GoogleSheetsService();
  }

  async importFromGoogleSheets(spreadsheetId: string, range: string = 'Sheet1!A:L') {
    try {
      const data = await this.sheetsService.readSheet(spreadsheetId, range);
      
      if (!data || data.length === 0) {
        throw new Error('No data found in the sheet');
      }

      const headers = data[0].map((header: string) => header.toLowerCase().trim());
      const rows = data.slice(1);

      const products = rows.map((row: any[]) => {
        const product: any = {};
        headers.forEach((header: string, index: number) => {
          if (row[index] !== undefined) {
            product[header] = row[index];
          }
        });
        return product;
      });

      return await this.processProductData(products);
    } catch (error) {
      console.error('Google Sheets import error:', error);
      throw error;
    }
  }

  async importFromFile(fileBuffer: Buffer, filename: string) {
    try {
      let data: any[];

      if (filename.endsWith('.csv')) {
        // Handle CSV files
        const csvText = fileBuffer.toString('utf-8');
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const product: any = {};
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              product[header] = values[index].trim();
            }
          });
          return product;
        });
      } else {
        // Handle Excel files
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length === 0) {
          throw new Error('No data found in the file');
        }

        const headers = data[0].map((header: string) => header.toLowerCase().trim());
        const rows = data.slice(1);
        
        data = rows.map((row: any[]) => {
          const product: any = {};
          headers.forEach((header: string, index: number) => {
            if (row[index] !== undefined) {
              product[header] = row[index];
            }
          });
          return product;
        });
      }

      return await this.processProductData(data);
    } catch (error) {
      console.error('File import error:', error);
      throw error;
    }
  }

  private async processProductData(data: any[]) {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
      products: [] as any[]
    };

    for (const item of data) {
      try {
        if (!item.name || !item.price) {
          results.errors.push(`Skipping row: Missing required fields (name or price)`);
          continue;
        }

        const productData: ProductData = {
          name: item.name || item.product,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          category: item.category || 'uncategorized',
          sku: item.sku,
          colors: item.colors,
          sizes: item.sizes,
          stock: parseInt(item.stock) || 0,
          images: item.images,
          tags: item.tags,
          type: item.type || 'clothing',
          isNew: item.isnew === 'true' || item.is_new === 'true',
          isBestseller: item.isbestseller === 'true' || item.is_bestseller === 'true'
        };

        const savedProduct = await this.saveProduct(productData);
        results.products.push(savedProduct);
        
        if (savedProduct.isNew) {
          results.created++;
        } else {
          results.updated++;
        }
      } catch (error) {
        results.errors.push(`Error processing product ${item.name}: ${error}`);
      }
    }

    return results;
  }

  private async saveProduct(productData: ProductData) {
    try {
      // Check if product exists by SKU or name
      let existingProduct = null;
      if (productData.sku) {
        existingProduct = await prisma.products.findFirst({
          where: { sku: productData.sku }
        });
      }
      
      if (!existingProduct && productData.name) {
        existingProduct = await prisma.products.findFirst({
          where: { name: productData.name }
        });
      }

      // Process images
      const images = productData.images 
        ? productData.images.split(',').map(url => url.trim()).filter(url => url.length > 0)
        : [];

      // Process sizes
      const sizes = productData.sizes
        ? productData.sizes.split(',').map(size => size.trim()).filter(size => size.length > 0)
        : [];

      const baseProductData = {
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        category: productData.category,
        sku: productData.sku || `SKU-${Date.now()}`,
        type: productData.type || 'clothing',
        images: images,
        sizes: sizes,
        isNew: productData.isNew || false,
        isBestseller: productData.isBestseller || false,
        rating: 0,
        reviews: 0,
        updatedAt: new Date()
      };

      let savedProduct;
      if (existingProduct) {
        // Update existing product
        savedProduct = await prisma.products.update({
          where: { id: existingProduct.id },
          data: baseProductData,
          include: { variants: true }
        });
        (savedProduct as any).isNew = false;
      } else {
        // Create new product
        savedProduct = await prisma.products.create({
          data: {
            ...baseProductData,
            createdAt: new Date()
          },
          include: { variants: true }
        });
        (savedProduct as any).isNew = true;
      }

      // Process color variants
      if (productData.colors) {
        await this.processColorVariants(savedProduct.id, productData.colors, productData.price, productData.stock || 0);
      }

      return savedProduct;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  private async processColorVariants(productId: number, colorsString: string, basePrice: number, baseStock: number) {
    const colors = colorsString.split(',').map(c => c.trim()).filter(c => c.length > 0);
    
    for (const color of colors) {
      const colorName = color;
      const colorValue = this.getColorHexValue(color);
      const sku = `${productId}-${colorName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

      try {
        // Check if variant already exists
        const existingVariant = await prisma.product_variants.findFirst({
          where: {
            productId: productId,
            colorName: colorName
          }
        });

        if (existingVariant) {
          // Update existing variant
          await prisma.product_variants.update({
            where: { id: existingVariant.id },
            data: {
              colorValue: colorValue,
              price: basePrice,
              stockQuantity: baseStock,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new variant
          await prisma.product_variants.create({
            data: {
              productId: productId,
              colorName: colorName,
              colorValue: colorValue,
              sku: sku,
              price: basePrice,
              stockQuantity: baseStock,
              isAvailable: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      } catch (error) {
        console.error(`Error processing variant ${colorName} for product ${productId}:`, error);
      }
    }
  }

  private getColorHexValue(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'black': '#000000',
      'white': '#FFFFFF',
      'yellow': '#FFFF00',
      'purple': '#800080',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'brown': '#A52A2A',
      'gray': '#808080',
      'grey': '#808080',
      'navy': '#000080',
      'maroon': '#800000',
      'olive': '#808000',
      'lime': '#00FF00',
      'aqua': '#00FFFF',
      'teal': '#008080',
      'silver': '#C0C0C0',
      'fuchsia': '#FF00FF'
    };

    const normalizedColorName = colorName.toLowerCase().trim();
    return colorMap[normalizedColorName] || '#CCCCCC'; // Default to light gray
  }

  generateTemplate() {
    const templateData = [
      {
        name: 'Sample T-Shirt',
        description: 'A comfortable cotton t-shirt',
        price: 29.99,
        category: 'clothing',
        sku: 'TSHIRT-001',
        colors: 'red, blue, green, black',
        sizes: 'S, M, L, XL',
        stock: 100,
        images: 'https://example.com/image1.jpg, https://example.com/image2.jpg',
        tags: 'casual, cotton, summer',
        type: 'clothing',
        isNew: 'false',
        isBestseller: 'true'
      },
      {
        name: 'Sample Hoodie',
        description: 'Warm and cozy hoodie',
        price: 59.99,
        category: 'clothing',
        sku: 'HOODIE-001',
        colors: 'black, gray, navy',
        sizes: 'S, M, L, XL, XXL',
        stock: 50,
        images: 'https://example.com/hoodie1.jpg',
        tags: 'warm, winter, casual',
        type: 'clothing',
        isNew: 'true',
        isBestseller: 'false'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

// API Handlers
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    const importService = new ProductImportService();

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return Response.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const results = await importService.importFromFile(buffer, file.name);

      return Response.json({
        message: 'Products imported successfully',
        ...results
      });
    } else {
      // Handle Google Sheets import
      const body = await request.json();
      const { spreadsheetId, range = 'Sheet1!A:L' } = body;

      if (!spreadsheetId) {
        return Response.json({ error: 'Spreadsheet ID is required' }, { status: 400 });
      }

      const results = await importService.importFromGoogleSheets(spreadsheetId, range);

      return Response.json({
        message: 'Products imported from Google Sheets successfully',
        ...results
      });
    }
  } catch (error) {
    console.error('Import error:', error);
    return Response.json(
      { error: 'Failed to import products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const importService = new ProductImportService();
    const templateBuffer = importService.generateTemplate();

    return new Response(templateBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename=product-import-template.xlsx',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return Response.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
