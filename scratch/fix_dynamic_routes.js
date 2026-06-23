const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file === 'route.ts' || file === 'route.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If it's already got a dynamic export, skip
      if (content.includes('export const dynamic =')) {
        continue;
      }
      
      // Inject force-dynamic globally for APIs that likely read cookies or url params
      content = "export const dynamic = 'force-dynamic'\n" + content;
      fs.writeFileSync(fullPath, content);
      console.log('Fixed ' + fullPath);
    }
  }
}

walk(path.join(__dirname, '../app/api'));
console.log('Done fixing API routes.');
