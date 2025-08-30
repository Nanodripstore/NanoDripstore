import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import https from 'https';

// Fix SSL issues on Windows
if (process.env.NODE_ENV !== 'production') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}

const prisma = new PrismaClient();

// Configure SSL for Google API requests on Windows
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  keepAlive: true,
  timeout: 30000,
});

// In-memory cache for sheet data
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class SheetCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = process.env.NODE_ENV === 'production' ? 30 * 1000 : 1 * 60 * 1000; // 30 seconds in production, 1 minute in dev

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const sheetCache = new SheetCache();

interface SheetRow {
  product_id: number;
  original_id?: string; // Store original string ID for lookup
  name: string;
  description: string;
  category: string;
  type: string;
  base_price: number;
  color_name: string;
  color_hex: string;
  size: string;
  variant_sku: string;
  variant_price: number;
  stock_quantity: number;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string;
  tags: string;
  is_new: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_date: string;
  last_updated: string;
}

class LiveSheetSyncService {
  private auth: any;
  private sheets: any;
  private spreadsheetId: string;
  private cachedSheetName: string | null = null;

  constructor() {
    this.spreadsheetId = process.env.LIVE_SHEET_ID || '';
    
    // Simple service account authentication
    try {
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
        private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SHEETS_CLIENT_EMAIL}`
      };

      // Use JWT directly for service account auth
      this.auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      
      this.sheets = google.sheets({ 
        version: 'v4', 
        auth: this.auth,
        timeout: 10000 // 10 second timeout
      });
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error);
      throw error;
    }
  }

  async syncFromSheet() {
    try {
      console.log('Starting sheet sync...');
      
      if (!this.spreadsheetId) {
        throw new Error('LIVE_SHEET_ID not configured');
      }

      // Read all data from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A2:U1000', // Skip header row, read up to 1000 rows
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in sheet');
        return { success: true, message: 'No data to sync', stats: { processed: 0, created: 0, updated: 0, errors: 0 } };
      }

      const stats = {
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0,
        products: new Set(),
        variants: 0
      };

      // Group rows by product_id to handle variants
      const productGroups = this.groupRowsByProduct(rows);

      for (const [productIdStr, productRows] of Object.entries(productGroups)) {
        try {
          const productId = parseInt(productIdStr);
          await this.syncProduct(productId, productRows, stats);
          stats.products.add(productId);
        } catch (error) {
          console.error(`Error syncing product ${productIdStr}:`, error);
          stats.errors++;
        }
      }

      console.log('Sheet sync completed:', {
        ...stats,
        products: stats.products.size
      });

      return {
        success: true,
        message: 'Sync completed successfully',
        stats: {
          ...stats,
          products: stats.products.size
        }
      };

    } catch (error) {
      console.error('Sheet sync failed:', error);
      throw error;
    }
  }

  private groupRowsByProduct(rows: any[][]): { [key: number]: SheetRow[] } {
    const groups: { [key: number]: SheetRow[] } = {};

    rows.forEach((row, index) => {
      try {
        const sheetRow = this.parseSheetRow(row);
        if (!sheetRow || !sheetRow.product_id) {
          console.warn(`Skipping invalid row ${index + 2}`);
          return;
        }

        if (!groups[sheetRow.product_id]) {
          groups[sheetRow.product_id] = [];
        }
        groups[sheetRow.product_id].push(sheetRow);
      } catch (error) {
        console.error(`Error parsing row ${index + 2}:`, error);
      }
    });

    return groups;
  }

  private parseSheetRow(row: any[]): SheetRow | null {
    if (!row[0] || !row[1]) return null; // Must have product_id and name

    // Validate that all required fields are provided
    if (!row[6] || !row[7] || !row[8] || !row[9]) {
      console.warn('Skipping row: Missing required fields (color_name, color_hex, size, or variant_sku)');
      return null;
    }

    // Handle product_id - can be numeric or string, but we need to convert/map it
    let productId: number;
    const rawProductId = row[0]?.toString().trim();
    
    if (!rawProductId) {
      console.warn('Skipping row: Empty product_id');
      return null;
    }

    // Try to parse as number first
    const numericId = parseInt(rawProductId);
    if (!isNaN(numericId) && numericId > 0) {
      productId = numericId;
    } else {
      // If it's a string like "acid-washed-oversized", create a more reliable hash
      console.warn(`Non-numeric product_id found: "${rawProductId}". Using enhanced hash mapping.`);
      
      // Create a more reliable hash that's less likely to collide
      let hash = 0;
      const str = rawProductId + (row[1]?.toString().trim() || ''); // Include name for uniqueness
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 7) - hash) + char; // Different shift to reduce collisions
        hash = hash & hash; // Convert to 32bit integer
      }
      productId = Math.abs(hash) % 100000 + 10000; // Ensure positive number between 10000-109999
    }

    return {
      product_id: productId,
      original_id: rawProductId, // Store the original ID for lookup purposes
      name: row[1]?.toString().trim() || '',
      description: row[2]?.toString().trim() || '',
      category: row[3]?.toString().trim() || 'uncategorized',
      type: row[4]?.toString().trim() || 'clothing',
      base_price: parseFloat(row[5]) || 0,
      color_name: row[6]?.toString().trim() || '',
      color_hex: row[7]?.toString().trim() || '',
      size: row[8]?.toString().trim() || '',
      variant_sku: row[9]?.toString().trim() || '',
      variant_price: parseFloat(row[10]) || parseFloat(row[5]) || 0,
      stock_quantity: parseInt(row[11]) || 0,
      image_url_1: row[12]?.toString().trim() || '',
      image_url_2: row[13]?.toString().trim() || '',
      image_url_3: row[14]?.toString().trim() || '',
      image_url_4: row[15]?.toString().trim() || '',
      tags: row[16]?.toString().trim() || '',
      is_new: this.parseBoolean(row[17]),
      is_bestseller: this.parseBoolean(row[18]),
      is_active: this.parseBoolean(row[19], true), // Default to true
      created_date: row[20]?.toString().trim() || new Date().toISOString().split('T')[0],
      last_updated: row[21]?.toString().trim() || row[20]?.toString().trim() || new Date().toISOString().split('T')[0]
    };
  }

  private async syncProduct(productId: number, productRows: SheetRow[], stats: any) {
    // Get the first row for base product data
    const baseRow = productRows[0];
    if (!baseRow.is_active) {
      console.log(`Skipping inactive product: ${productId}`);
      return;
    }

    stats.processed++;

    // Prepare images array
    const images = [baseRow.image_url_1, baseRow.image_url_2, baseRow.image_url_3, baseRow.image_url_4]
      .filter(url => url && url.length > 0 && (url.startsWith('http') || url.startsWith('/')));

    // Prepare sizes array (unique sizes from all variants)
    const sizes = [...new Set(productRows.map(row => row.size).filter(size => size))];

    // Check if product exists
    const existingProduct = await prisma.products.findFirst({
      where: { 
        OR: [
          { sku: productId.toString() },
          { name: baseRow.name }
        ]
      },
      include: { variants: true }
    });

    let product;
    if (existingProduct) {
      // Update existing product
      product = await prisma.products.update({
        where: { id: existingProduct.id },
        data: {
          name: baseRow.name,
          description: baseRow.description,
          price: baseRow.base_price,
          category: baseRow.category,
          type: baseRow.type,
          sku: productId.toString(),
          images: images,
          sizes: sizes,
          isNew: baseRow.is_new,
          isBestseller: baseRow.is_bestseller,
          updatedAt: new Date()
        },
        include: { variants: true }
      });
      stats.updated++;
    } else {
      // Create new product
      product = await prisma.products.create({
        data: {
          name: baseRow.name,
          description: baseRow.description,
          price: baseRow.base_price,
          category: baseRow.category,
          type: baseRow.type,
          sku: productId.toString(),
          images: images,
          sizes: sizes,
          isNew: baseRow.is_new,
          isBestseller: baseRow.is_bestseller,
          rating: 0,
          reviews: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: { variants: true }
      });
      stats.created++;
    }

    // Sync variants
    await this.syncProductVariants(product.id, productRows, stats);
  }

  private async syncProductVariants(productId: number, productRows: SheetRow[], stats: any) {
    for (const row of productRows) {
      if (!row.color_name || !row.size) continue;

      try {
        // Check if variant exists
        const existingVariant = await prisma.product_variants.findFirst({
          where: {
            productId: productId,
            colorName: row.color_name,
            sku: row.variant_sku
          }
        });

        if (existingVariant) {
          // Update existing variant
          await prisma.product_variants.update({
            where: { id: existingVariant.id },
            data: {
              colorValue: row.color_hex,
              price: row.variant_price,
              stockQuantity: row.stock_quantity,
              isAvailable: row.is_active && row.stock_quantity > 0,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new variant
          await prisma.product_variants.create({
            data: {
              productId: productId,
              colorName: row.color_name,
              colorValue: row.color_hex,
              sku: row.variant_sku,
              price: row.variant_price,
              stockQuantity: row.stock_quantity,
              isAvailable: row.is_active && row.stock_quantity > 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
        stats.variants++;
      } catch (error) {
        console.error(`Error syncing variant ${row.variant_sku}:`, error);
        stats.errors++;
      }
    }
  }

  private generateVariantSku(productId: string, color: string, size: string): string {
    const colorCode = color?.replace(/\s+/g, '').toUpperCase().substring(0, 3) || 'COL';
    const sizeCode = size?.toUpperCase() || 'SIZE';
    return `${productId}-${colorCode}-${sizeCode}`;
  }

  private getColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
      'black': '#000000', 'white': '#FFFFFF', 'yellow': '#FFFF00',
      'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB',
      'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',
      'navy': '#000080', 'maroon': '#800000', 'olive': '#808000',
      'lime': '#00FF00', 'aqua': '#00FFFF', 'teal': '#008080',
      'silver': '#C0C0C0', 'fuchsia': '#FF00FF'
    };

    const normalized = colorName?.toLowerCase().trim() || '';
    return colorMap[normalized] || '#CCCCCC';
  }

  // Auto-update sheet with timestamps only (no more auto-generation)
  async updateSheetWithTimestamps(rows: SheetRow[]) {
    try {
      const updates: string[][] = [];
      
      rows.forEach((row, index) => {
        // Update timestamps only
        const now = new Date().toISOString().split('T')[0];
        if (!row.created_date) row.created_date = now;
        row.last_updated = now;
        
        updates.push([row.last_updated]);
      });

      // Update only the last_updated column
      if (updates.length > 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Sheet1!U2:U1000', // last_updated column
          valueInputOption: 'RAW',
          resource: {
            values: updates
          }
        });
      }
    } catch (error) {
      console.error('Error updating sheet with timestamps:', error);
    }
  }

  private parseBoolean(value: any, defaultValue = false): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return lower === 'true' || lower === 'yes' || lower === '1';
    }
    return defaultValue;
  }

  // Get products directly from sheet for frontend display
  async getProductsFromSheet(options: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      const { query = '', category, page = 1, limit = 12, sortBy = 'product_id', sortOrder = 'asc' } = options;

      // Create cache key based on parameters (excluding pagination for better cache hits)
      const cacheKey = `sheet-products-${query}-${category}-${sortBy}-${sortOrder}`;
      
      // Try to get from cache first
      let allProducts = sheetCache.get(cacheKey);
      
      if (!allProducts) {
        console.log('Cache miss, fetching from Google Sheets...');
        
        if (!this.spreadsheetId) {
          throw new Error('LIVE_SHEET_ID not configured');
        }

        // Optimize: Get spreadsheet info only once per instance
        if (!this.cachedSheetName) {
          const spreadsheetInfo = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
          });
          
          const firstSheet = spreadsheetInfo.data.sheets?.[0];
          if (!firstSheet) {
            throw new Error('No sheets found in the spreadsheet');
          }
          
          this.cachedSheetName = firstSheet.properties?.title || 'Sheet1';
        }

        // Read data with optimized range
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `${this.cachedSheetName}!A2:U1000`, // Use cached sheet name
          majorDimension: 'ROWS',
          valueRenderOption: 'UNFORMATTED_VALUE'
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
          return {
            products: [],
            pagination: { total: 0, pages: 0, current: page, hasNext: false, hasPrev: false }
          };
        }

        // Parse rows efficiently
        const parsedRows: SheetRow[] = [];
        for (let i = 0; i < rows.length; i++) {
          try {
            const sheetRow = this.parseSheetRow(rows[i]);
            if (sheetRow && sheetRow.is_active) {
              parsedRows.push(sheetRow);
            }
          } catch (error) {
            // Skip invalid rows silently in production
            if (process.env.NODE_ENV !== 'production') {
              console.error(`Error parsing row ${i + 2}:`, error);
            }
          }
        }

        // Group by product_id and convert to product format
        const productGroups = this.groupRowsByProductOptimized(parsedRows);
        allProducts = this.convertToProductFormat(productGroups);

        // Cache the processed products with very short TTL for real-time updates
        sheetCache.set(cacheKey, allProducts, 1 * 60 * 1000); // 1 minute cache for real-time responsiveness
        console.log(`Cached ${allProducts.length} products for 1 minute`);
      } else {
        console.log('Cache hit, returning cached products');
      }

      // Apply filters and sorting on cached data
      let filteredProducts = [...allProducts];

      // Filter by query
      if (query) {
        const queryLower = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(queryLower) ||
          product.description.toLowerCase().includes(queryLower) ||
          product.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))
        );
      }

      // Filter by category
      if (category) {
        filteredProducts = filteredProducts.filter(product => product.category === category);
      }

      // Sort products
      filteredProducts.sort((a, b) => {
        const aValue = (a as any)[sortBy] || 0;
        const bValue = (b as any)[sortBy] || 0;
        
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Apply pagination
      const total = filteredProducts.length;
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(skip, skip + limit);

      return {
        products: paginatedProducts,
        pagination: {
          total,
          pages,
          current: page,
          hasNext: page < pages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('Error fetching products from sheet:', error);
      throw error;
    }
  }

  // Get a single product by slug from the sheet
  async getProductBySlug(slug: string) {
    try {
      // Create specific cache key for individual product
      const productCacheKey = `product-${slug}`;
      
      // Check cache first
      let product = sheetCache.get(productCacheKey);
      
      if (product) {
        console.log(`Cache hit for product: ${slug}`);
        return product;
      }
      
      console.log(`Cache miss for product: ${slug}, fetching from sheet...`);
      
      // First get all products from the sheet (this will be cached)
      const result = await this.getProductsFromSheet({ limit: 1000 }); // Get all products
      
      // Find the product by creating a slug from the name and matching
      product = result.products.find(p => {
        // Create a slug from the product name (similar to how slug routing works)
        const productSlug = p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        return productSlug === slug;
      });

      if (!product) {
        return null;
      }

      // Cache the individual product for 15 minutes
      sheetCache.set(productCacheKey, product, 15 * 60 * 1000);
      console.log(`Cached product: ${slug}`);

      // Return the product in the same format expected by the frontend
      return product;

    } catch (error) {
      console.error('Error fetching product by slug from sheet:', error);
      throw error;
    }
  }

  // Optimized method to group rows by product ID
  private groupRowsByProductOptimized(rows: SheetRow[]): { [key: number]: SheetRow[] } {
    const groups: { [key: number]: SheetRow[] } = {};
    
    for (const row of rows) {
      const productId = row.product_id;
      if (!groups[productId]) {
        groups[productId] = [];
      }
      groups[productId].push(row);
    }
    
    return groups;
  }

  // Optimized method to convert product groups to frontend format
  private convertToProductFormat(productGroups: { [key: number]: SheetRow[] }): any[] {
    return Object.entries(productGroups).map(([productId, variants]) => {
      const baseVariant = variants[0];
      
      // Optimized image filtering
      const images = this.getValidImages([
        baseVariant.image_url_1, 
        baseVariant.image_url_2, 
        baseVariant.image_url_3, 
        baseVariant.image_url_4
      ]);
      
      // Properly deduplicate colors by color name
      const uniqueColors = variants.reduce((acc: any[], variant) => {
        const existingColor = acc.find(c => c.name === variant.color_name);
        if (!existingColor) {
          acc.push({ name: variant.color_name, hex: variant.color_hex });
        }
        return acc;
      }, []);
      
      return {
        id: parseInt(productId),
        name: baseVariant.name,
        description: baseVariant.description,
        price: baseVariant.base_price,
        category: baseVariant.category,
        type: baseVariant.type,
        sku: productId,
        images: images,
        isNew: baseVariant.is_new,
        isBestseller: baseVariant.is_bestseller,
        rating: 0,
        reviews: 0,
        variants: variants.map(v => ({
          id: `${productId}_${v.color_name}_${v.size}`.replace(/\s+/g, '_'),
          productId: parseInt(productId),
          colorName: v.color_name,
          colorValue: v.color_hex,
          sku: v.variant_sku,
          price: v.variant_price,
          stockQuantity: v.stock_quantity,
          isAvailable: v.is_active && v.stock_quantity > 0,
          size: v.size,
          images: this.getValidImages([v.image_url_1, v.image_url_2, v.image_url_3, v.image_url_4])
        })),
        sizes: [...new Set(variants.map(v => v.size))],
        colors: uniqueColors,
        tags: baseVariant.tags ? baseVariant.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        createdAt: baseVariant.created_date,
        updatedAt: baseVariant.last_updated
      };
    });
  }

  // Optimized image URL validation and processing
  private getValidImages(urls: string[]): string[] {
    return urls
      .filter(url => url && url.length > 0)
      .map(url => this.processImageUrl(url))
      .filter(url => url !== null) as string[];
  }

  // Enhanced image URL processor for Google Drive and other sources
  private processImageUrl(url: string): string | null {
    if (!url || url.trim().length === 0) {
      return null;
    }

    const trimmedUrl = url.trim();

    // If it's already a direct HTTP/HTTPS URL (not a Google Drive share link), return as is
    if (trimmedUrl.startsWith('http') && !trimmedUrl.includes('drive.google.com/file/d/')) {
      return trimmedUrl;
    }

    // Handle local paths (fallback for existing local images)
    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }

    // Handle Google Drive shareable links
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const driveShareMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveShareMatch) {
      const fileId = driveShareMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Handle Google Drive direct view links (already optimized)
    if (trimmedUrl.includes('drive.google.com/uc?')) {
      return trimmedUrl;
    }

    // Handle bare Google Drive file IDs (28+ characters, alphanumeric with hyphens/underscores)
    if (/^[a-zA-Z0-9_-]{28,}$/.test(trimmedUrl)) {
      return `https://drive.google.com/uc?export=view&id=${trimmedUrl}`;
    }

    // Handle other cloud storage providers
    // Cloudinary
    if (trimmedUrl.includes('cloudinary.com')) {
      return trimmedUrl;
    }

    // AWS S3
    if (trimmedUrl.includes('amazonaws.com') || trimmedUrl.includes('s3.')) {
      return trimmedUrl;
    }

    // Firebase Storage
    if (trimmedUrl.includes('firebasestorage.googleapis.com')) {
      return trimmedUrl;
    }

    // If we can't process it, log a warning and return null
    console.warn(`Unable to process image URL: ${trimmedUrl}`);
    return null;
  }

  // Method to clear cache when data is updated
  clearCache(): void {
    sheetCache.clear();
    console.log('Sheet cache cleared');
  }

  // Method to invalidate specific cache entries
  invalidateCache(pattern?: string): void {
    sheetCache.invalidate(pattern);
    console.log(`Cache invalidated for pattern: ${pattern || 'all'}`);
  }
}

export default LiveSheetSyncService;
