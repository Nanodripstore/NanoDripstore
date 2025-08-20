"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  sku: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: number;
  productId: number;
  colorName: string;
  colorValue: string;
  sku: string;
  price?: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export default function VariantsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingVariant, setAddingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [newVariant, setNewVariant] = useState({
    colorName: '',
    colorValue: '#000000',
    sku: '',
    price: '',
    stockQuantity: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    console.log('Fetching products...');
    try {
      const response = await fetch('/api/admin/products-with-variants');
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data.products.length, 'products');
        setProducts(data.products);
        
        // Update selected product if it exists
        if (selectedProduct) {
          console.log('Updating selected product...');
          const updatedSelectedProduct = data.products.find((p: any) => p.id === selectedProduct.id);
          if (updatedSelectedProduct) {
            console.log('Selected product updated with', updatedSelectedProduct.variants.length, 'variants');
            setSelectedProduct(updatedSelectedProduct);
          }
        }
      } else {
        console.error('Failed to fetch products:', response.status);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addVariant = async () => {
    console.log('Add variant button clicked!');
    console.log('Selected product:', selectedProduct);
    console.log('New variant data:', newVariant);

    if (!selectedProduct) {
      console.log('No product selected!');
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive"
      });
      return;
    }

    if (!newVariant.colorName || !newVariant.sku) {
      console.log('Missing required fields!');
      toast({
        title: "Error",
        description: "Please fill in color name and SKU",
        variant: "destructive"
      });
      return;
    }

    console.log('Adding variant to product:', {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      colorName: newVariant.colorName,
      sku: newVariant.sku
    });

    // Check if color already exists for this product
    const existingColor = selectedProduct.variants.find(
      v => v.colorName.toLowerCase() === newVariant.colorName.toLowerCase()
    );
    
    if (existingColor) {
      console.log('Color already exists!');
      toast({
        title: "Error",
        description: `A variant with color "${newVariant.colorName}" already exists for this product`,
        variant: "destructive"
      });
      return;
    }

    // Check if SKU already exists anywhere
    console.log('Checking for existing SKUs...');
    console.log('New variant SKU:', newVariant.sku);
    
    const existingSku = products.some(product => {
      console.log(`Checking product: ${product.name} (${product.variants.length} variants)`);
      return product.variants.some(variant => {
        console.log(`  Variant SKU: "${variant.sku}" vs New SKU: "${newVariant.sku}"`);
        const match = variant.sku === newVariant.sku;
        if (match) {
          console.log(`  MATCH FOUND! Existing variant: ${variant.colorName} in product ${product.name}`);
        }
        return match;
      });
    });
    
    if (existingSku) {
      console.log('SKU already exists!');
      toast({
        title: "Error",
        description: "This SKU is already in use by another variant",
        variant: "destructive"
      });
      return;
    }
    
    console.log('No existing SKU found, proceeding...');

    try {
      setAddingVariant(true);
      console.log('Making API request...');
      
      const requestBody = {
        productId: selectedProduct.id,
        colorName: newVariant.colorName,
        colorValue: newVariant.colorValue,
        sku: newVariant.sku,
        price: newVariant.price ? parseFloat(newVariant.price) : null,
        stockQuantity: newVariant.stockQuantity
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Variant added successfully!');
        toast({
          title: "Success",
          description: `Variant "${newVariant.colorName}" added to ${selectedProduct.name}`
        });
        
        // Reset form
        setNewVariant({
          colorName: '',
          colorValue: '#000000',
          sku: '',
          price: '',
          stockQuantity: 0
        });
        
        // Refresh products data
        console.log('Refreshing products...');
        await fetchProducts();
        
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        toast({
          title: "Error",
          description: error.error || "Failed to add variant",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast({
        title: "Error",
        description: "Failed to add variant",
        variant: "destructive"
      });
    } finally {
      setAddingVariant(false);
    }
  };

  const deleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Variant deleted successfully"
        });
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete variant",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive"
      });
    }
  };

  const startEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant.id);
    setNewVariant({
      colorName: variant.colorName,
      colorValue: variant.colorValue,
      sku: variant.sku,
      price: variant.price?.toString() || '',
      stockQuantity: variant.stockQuantity
    });
  };

  const cancelEdit = () => {
    setEditingVariant(null);
    setNewVariant({
      colorName: '',
      colorValue: '#000000',
      sku: '',
      price: '',
      stockQuantity: 0
    });
  };

  const updateVariant = async () => {
    if (!editingVariant || !selectedProduct) return;

    if (!newVariant.colorName || !newVariant.sku) {
      toast({
        title: "Error",
        description: "Please fill in color name and SKU",
        variant: "destructive"
      });
      return;
    }

    // Check if color already exists for this product (excluding current variant)
    const existingColor = selectedProduct.variants.find(
      v => v.id !== editingVariant && v.colorName.toLowerCase() === newVariant.colorName.toLowerCase()
    );
    
    if (existingColor) {
      toast({
        title: "Error",
        description: `A variant with color "${newVariant.colorName}" already exists for this product`,
        variant: "destructive"
      });
      return;
    }

    // Check if SKU already exists anywhere (excluding current variant)
    const existingSku = products.some(product => 
      product.variants.some(variant => variant.id !== editingVariant && variant.sku === newVariant.sku)
    );
    
    if (existingSku) {
      toast({
        title: "Error",
        description: "This SKU is already in use by another variant",
        variant: "destructive"
      });
      return;
    }

    try {
      setAddingVariant(true);
      
      const response = await fetch(`/api/admin/variants/${editingVariant}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingVariant,
          colorName: newVariant.colorName,
          colorValue: newVariant.colorValue,
          sku: newVariant.sku,
          price: newVariant.price ? parseFloat(newVariant.price) : null,
          stockQuantity: newVariant.stockQuantity,
          isAvailable: true
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Variant updated successfully"
        });
        
        cancelEdit();
        await fetchProducts();
        
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update variant",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      toast({
        title: "Error",
        description: "Failed to update variant",
        variant: "destructive"
      });
    } finally {
      setAddingVariant(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Variants Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                <div className="text-sm text-gray-500">
                  {product.variants.length} variant(s)
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Variants List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProduct ? `${selectedProduct.name} - Variants` : 'Select a Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-3">
                {selectedProduct.variants.map((variant) => (
                  <div key={variant.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: variant.colorValue }}
                          ></div>
                          <span className="font-medium">{variant.colorName}</span>
                          {!variant.isAvailable && (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          SKU: {variant.sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock: {variant.stockQuantity}
                        </div>
                        {variant.price && (
                          <div className="text-sm text-gray-500">
                            Price: ${variant.price}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditVariant(variant)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVariant(variant.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Select a product to view its variants</p>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Variant */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </CardTitle>
            {selectedProduct && (
              <div className={`mt-2 p-2 border rounded ${
                editingVariant 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm font-medium ${
                  editingVariant ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  {editingVariant ? 'Editing variant for:' : 'Adding variant to:'} <span className="font-bold">{selectedProduct.name}</span>
                </p>
                <p className={`text-xs ${
                  editingVariant ? 'text-yellow-600' : 'text-green-600'
                }`}>ID: {selectedProduct.id}</p>
                {editingVariant && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="mt-2"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                {selectedProduct.variants.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800 mb-1">Existing colors for this product:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.variants.map((variant) => (
                        <span
                          key={variant.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: variant.colorValue }}
                          ></div>
                          {variant.colorName}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Note: Each color can only be added once per product
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="colorName">Color Name *</Label>
                  <Input
                    id="colorName"
                    placeholder="e.g., Light Baby Pink, Royal Blue, Forest Green"
                    value={newVariant.colorName}
                    onChange={(e) => setNewVariant({ ...newVariant, colorName: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Must be unique for this product
                  </p>
                </div>

                <div>
                  <Label htmlFor="colorValue">Color Value *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorValue"
                      type="color"
                      value={newVariant.colorValue}
                      onChange={(e) => setNewVariant({ ...newVariant, colorValue: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      placeholder="#000000"
                      value={newVariant.colorValue}
                      onChange={(e) => setNewVariant({ ...newVariant, colorValue: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">Qikink SKU *</Label>
                  <Textarea
                    id="sku"
                    placeholder="e.g., v-9x-m0CGFaVZV0MIPNxcvubHVqQ_f-XI="
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the exact SKU provided by Qikink for this specific product-color combination. 
                    Each SKU must be globally unique.
                  </p>
                </div>

                <div>
                  <Label htmlFor="price">Price Override (optional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to use base price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={newVariant.stockQuantity}
                    onChange={(e) => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      console.log(`${editingVariant ? 'Update' : 'Add'} button clicked!`);
                      if (editingVariant) {
                        updateVariant();
                      } else {
                        addVariant();
                      }
                    }} 
                    className="flex-1" 
                    disabled={addingVariant}
                  >
                    {editingVariant ? (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        {addingVariant ? 'Updating...' : 'Update Variant'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {addingVariant ? 'Adding...' : 'Add Variant'}
                      </>
                    )}
                  </Button>
                  
                  {editingVariant && (
                    <Button 
                      onClick={cancelEdit}
                      variant="outline"
                      disabled={addingVariant}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Refresh button clicked!');
                    fetchProducts();
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Refresh Products
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Select a product to add variants</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
