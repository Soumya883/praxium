const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath, query);
      } else if (file.endsWith('.d.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          console.log(`Found "${query}" in: ${fullPath}`);
          // Print 300 chars around the match
          const idx = content.indexOf(query);
          console.log(content.substring(idx - 50, idx + 250));
          console.log("------------------------");
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

searchDir(path.join(__dirname, '../node_modules'), 'colorBackground?:');
searchDir(path.join(__dirname, '../node_modules'), 'colorBackground:');
