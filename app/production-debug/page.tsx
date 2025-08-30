"use client";

import { useState, useEffect } from 'react';
import { SimpleProxiedImage } from '@/components/simple-proxied-image';

export default function ProductionImageDiagnostic() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [imageLoadStatus, setImageLoadStatus] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    runDiagnostics();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/live');
      const data = await response.json();
      setProducts(data.products || []);
      if (data.products?.length > 0) {
        setSelectedProduct(data.products[0]);
        const firstColor = data.products[0].colors?.[0]?.name;
        if (firstColor) {
          setSelectedColor(firstColor);
          updateImageForColor(data.products[0], firstColor);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const runDiagnostics = async () => {
    try {
      const response = await fetch('/api/debug/production-images');
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    }
  };

  const updateImageForColor = (product: any, colorName: string) => {
    console.log('🎨 Updating image for color:', colorName);
    
    // Find matching variant
    const matchingVariant = product.variants?.find((v: any) => v.colorName === colorName);
    
    let imageToShow = '/placeholder-image.svg'; // Default fallback
    
    if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0 && matchingVariant.images[0].trim() !== '') {
      imageToShow = matchingVariant.images[0];
      console.log('✅ Found variant-specific image:', imageToShow);
    } else {
      // Fallback to product-level images by color index
      const colorIndex = product.colors?.findIndex((c: any) => c.name === colorName);
      if (colorIndex >= 0 && colorIndex < product.images?.length && product.images[colorIndex].trim() !== '') {
        imageToShow = product.images[colorIndex];
        console.log('📸 Using product-level image at index:', colorIndex, imageToShow);
      } else if (product.images?.[0] && product.images[0].trim() !== '') {
        imageToShow = product.images[0];
        console.log('⚠️ Fallback to first image:', imageToShow);
      } else {
        console.log('❌ No valid image found, using placeholder');
      }
    }
    
    setCurrentImage(imageToShow);
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    if (selectedProduct) {
      updateImageForColor(selectedProduct, colorName);
    }
  };

  const testSpecificImage = async (imageUrl: string, description: string) => {
    const testId = Date.now();
    const testResult = {
      id: testId,
      description,
      imageUrl,
      status: 'testing',
      startTime: new Date().toISOString(),
      logs: []
    };
    
    setTestResults(prev => [...prev, testResult]);
    
    try {
      // Test if the URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      testResult.status = response.ok ? 'success' : 'failed';
      testResult.httpStatus = response.status;
      testResult.contentType = response.headers.get('content-type');
      testResult.endTime = new Date().toISOString();
      
      setTestResults(prev => 
        prev.map(t => t.id === testId ? testResult : t)
      );
      
    } catch (error: any) {
      testResult.status = 'error';
      testResult.error = error.message;
      testResult.endTime = new Date().toISOString();
      
      setTestResults(prev => 
        prev.map(t => t.id === testId ? testResult : t)
      );
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    console.log('✅ Image loaded successfully:', imageUrl);
    setImageLoadStatus(prev => ({
      ...prev,
      [imageUrl]: { status: 'loaded', timestamp: new Date().toISOString() }
    }));
  };

  const handleImageError = (imageUrl: string) => {
    console.error('❌ Image failed to load:', imageUrl);
    setImageLoadStatus(prev => ({
      ...prev,
      [imageUrl]: { status: 'failed', timestamp: new Date().toISOString() }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Production Image Diagnostic Tool
        </h1>
        
        {/* Environment Info */}
        {diagnostics && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Diagnostics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Environment:</strong> {diagnostics.environment}
              </div>
              <div>
                <strong>Has Sheet ID:</strong> {diagnostics.hasSheetId ? '✅' : '❌'}
              </div>
              <div>
                <strong>Has Google Creds:</strong> {diagnostics.hasGoogleCreds ? '✅' : '❌'}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(diagnostics.timestamp).toLocaleString()}
              </div>
            </div>
            
            {diagnostics.sampleUrlTests && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Sample URL Tests:</h3>
                <div className="space-y-2">
                  {diagnostics.sampleUrlTests.map((test: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        {test.success ? '✅' : '❌'}
                        <span>Status: {test.status || 'Error'}</span>
                        <span className="text-gray-600">Type: {test.contentType || 'N/A'}</span>
                      </div>
                      {test.error && (
                        <div className="text-red-600 text-xs mt-1">Error: {test.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Selection */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow">
          <h2 className="text-xl font-semibold mb-4">Color Image Testing</h2>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product:</label>
                <select 
                  value={selectedProduct.id} 
                  onChange={(e) => {
                    const product = products.find(p => p.id == e.target.value);
                    setSelectedProduct(product);
                    if (product?.colors?.[0]) {
                      handleColorChange(product.colors[0].name);
                    }
                  }}
                  className="border rounded px-3 py-2"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors?.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(color.name)}
                      className={`px-3 py-1 rounded border text-sm ${
                        selectedColor === color.name 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Image Display */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Current Image for "{selectedColor}":</h3>
                <div className="mb-2 text-sm text-gray-600 break-all">
                  URL: {currentImage}
                </div>
                
                {currentImage && (
                  <div className="space-y-4">
                    <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <SimpleProxiedImage
                        src={currentImage}
                        alt={`${selectedProduct.name} - ${selectedColor}`}
                        className="w-full h-full"
                        onLoad={() => handleImageLoad(currentImage)}
                        onError={() => handleImageError(currentImage)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => testSpecificImage(currentImage, `${selectedProduct.name} - ${selectedColor}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Test This Image URL
                      </button>
                      
                      <div className="text-sm">
                        Status: {imageLoadStatus[currentImage]?.status || 'Not tested'}
                        {imageLoadStatus[currentImage]?.timestamp && (
                          <div className="text-gray-500">
                            {new Date(imageLoadStatus[currentImage].timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map(test => (
                <div key={test.id} className="border rounded p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {test.status === 'success' && '✅'}
                    {test.status === 'failed' && '❌'}
                    {test.status === 'error' && '⚠️'}
                    {test.status === 'testing' && '⏳'}
                    <strong>{test.description}</strong>
                    {test.httpStatus && <span className="text-gray-600">({test.httpStatus})</span>}
                  </div>
                  
                  <div className="text-gray-600 break-all mb-1">
                    {test.imageUrl}
                  </div>
                  
                  {test.error && (
                    <div className="text-red-600 text-xs">
                      Error: {test.error}
                    </div>
                  )}
                  
                  {test.contentType && (
                    <div className="text-gray-500 text-xs">
                      Content-Type: {test.contentType}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
