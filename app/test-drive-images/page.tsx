import { RobustDriveImage } from '@/components/robust-drive-image';

export default function TestDriveImages() {
  const testImages = [
    {
      url: 'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
      name: 'Test Image 1'
    },
    {
      url: 'https://drive.google.com/file/d/1WdwEBU3UMAREI7_-ZLRn0UAPBX8dIwz6/view?usp=sharing',
      name: 'Test Image 2'
    },
    {
      url: 'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
      name: 'Test Image 3 (Problematic)'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Google Drive Image Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((image, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">{image.name}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original URL:</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{image.url}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Robust Drive Image Component:</h3>
              <RobustDriveImage
                src={image.url}
                alt={image.name}
                width={300}
                height={200}
                className="border rounded"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How it works:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>First attempts to load using <code>export=download</code> format</li>
          <li>If that fails, tries thumbnail format with appropriate sizing</li>
          <li>If that fails, tries <code>export=view</code> format</li>
          <li>If all fail, shows a placeholder</li>
        </ol>
      </div>
    </div>
  );
}
