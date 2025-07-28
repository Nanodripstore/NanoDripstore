const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function updateFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Replace all instances of "new Response(JSON.stringify(...)" with "Response.json(...)"
    const updatedContent = content.replace(
      /new Response\(JSON\.stringify\((.*?)\),\s*\{\s*status:\s*(.*?),\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\s*\}\)/gs, 
      'Response.json($1, { status: $2 })'
    );
    
    // Write the updated content back to the file
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Process cart route file
async function processCarts() {
  const cartFile = path.join(__dirname, '..', 'app', 'api', 'user', 'cart', 'route.ts');
  await updateFile(cartFile);
  console.log('Cart route file has been processed.');
}

// Run the script
processCarts();
