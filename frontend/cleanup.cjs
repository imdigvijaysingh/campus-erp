const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  
  // Remove imports
  content = content.replace(/import\s+Navbar\s+from\s+['"].*?['"];?\n/g, '');
  content = content.replace(/import\s+Footer\s+from\s+['"].*?['"];?\n/g, '');
  
  // Remove <Navbar ... /> tag block
  content = content.replace(/<Navbar[\s\S]*?\/>\s*/g, '');
  
  // Remove <Footer ... /> tag block
  content = content.replace(/<Footer[\s\S]*?\/>\s*/g, '');
  
  fs.writeFileSync(path.join(pagesDir, file), content);
  console.log('Cleaned', file);
});
