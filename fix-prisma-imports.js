const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Target directory
const apiDir = path.join(__dirname, 'app', 'api');

// Function to recursively get all TypeScript files in a directory
async function getFilesRecursively(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursively(res) : res;
    })
  );
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Function to fix imports in a file
async function fixImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Fix import statement
    let updatedContent = content.replace(
      /import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/db['"]/g,
      `import { db } from '@/lib/db'`
    );
    
    // Fix db as prisma import
    updatedContent = updatedContent.replace(
      /import\s*{\s*db\s+as\s+prisma\s*}\s*from\s*['"]@\/lib\/db['"]/g,
      `import { db } from '@/lib/db'`
    );
    
    // Replace all prisma. with db.
    updatedContent = updatedContent.replace(/\bprisma\./g, 'db.');
    
    // Only write if there are changes
    if (content !== updatedContent) {
      await writeFile(filePath, updatedContent);
      console.log(`Fixed imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    const files = await getFilesRecursively(apiDir);
    console.log(`Found ${files.length} TypeScript files to check`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      const fixed = await fixImports(file);
      if (fixed) fixedCount++;
    }
    
    console.log(`Fixed imports in ${fixedCount} files`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
