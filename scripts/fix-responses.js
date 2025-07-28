const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Function to update the code
async function updateFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Replace all instances of "new Response(JSON.stringify(...)" with "Response.json(...)"
    const updatedContent = content.replace(
      /new Response\(JSON\.stringify\((.*?)\), \{\s*status: (.*?),\s*headers: \{ 'Content-Type': 'application\/json' \}\s*\}\)/g, 
      'Response.json($1, { status: $2 })'
    );
    
    // Write the updated content back to the file
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// List of files to update
const filesToUpdate = [
  path.join(__dirname, '..', 'app', 'api', 'user', 'cart', '[cartItemId]', 'route.ts'),
  path.join(__dirname, '..', 'app', 'api', 'user', 'wishlist', '[wishlistItemId]', 'route.ts'),
  path.join(__dirname, '..', 'app', 'api', 'user', 'wishlist', 'route.ts'),
  path.join(__dirname, '..', 'app', 'api', 'user', 'orders', 'route.ts')
];

// Process each file
async function processFiles() {
  for (const file of filesToUpdate) {
    await updateFile(file);
  }
  console.log('All files have been processed.');
}

// Run the script
processFiles();
