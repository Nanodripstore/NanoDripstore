const fs = require('fs');
const path = require('path');

// Define the base directories for API routes
const directories = [
    path.join(__dirname, '../app/api/user'),
    path.join(__dirname, '../app/api/products'),
    path.join(__dirname, '../app/api/categories')
];

// Function to process a single file
function processFile(filePath) {
    console.log(`Processing ${filePath}...`);
    try {
        // Read the file content
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace imports
        content = content.replace(/import\s*{\s*NextRequest,\s*NextResponse\s*}\s*from\s*'next\/server'/g, 
                              "");
                              
        // Replace NextRequest with Request
        content = content.replace(/NextRequest/g, 'Request');
        
        // Replace NextResponse.json with Response.json
        content = content.replace(/NextResponse\.json/g, 'Response.json');
        
        // Replace new NextResponse with new Response
        content = content.replace(/new\s+NextResponse/g, 'new Response');
        
        // Special handling for dynamic route params in [slug]
        if (filePath.includes('[')) {
            // Update dynamic route params handling
            const dynamicParamRegex = /export\s+async\s+function\s+GET\s*\(\s*req\s*:\s*Request\s*,\s*{\s*params\s*}\s*:\s*{\s*params\s*:\s*{\s*([a-zA-Z]+)\s*:\s*string\s*}\s*}\s*\)/g;
            content = content.replace(dynamicParamRegex, 
                'export async function GET(req: Request, context: { params: { $1: string } })');
                
            // Also update any direct references to params.<param> to context.params.<param>
            const dynamicNameMatch = filePath.match(/\[([a-zA-Z]+)\]/);
            if (dynamicNameMatch && dynamicNameMatch[1]) {
                const paramName = dynamicNameMatch[1];
                const paramAccessRegex = new RegExp(`params\\.${paramName}`, 'g');
                content = content.replace(paramAccessRegex, `context.params.${paramName}`);
            }
        }
        
        // Write back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully updated ${filePath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

// Function to recursively process all .ts files in a directory
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

// Process each directory
directories.forEach(dir => {
    console.log(`Processing directory: ${dir}`);
    processDirectory(dir);
});
