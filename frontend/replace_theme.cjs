const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { search: /#0D1728/g, replace: 'var(--panel-base)' },
  { search: /#111D31/g, replace: 'var(--panel-raised)' },
  { search: /#050A14/g, replace: 'var(--bg-app)' },
  { search: /#4F7CFF/g, replace: 'var(--accent-primary)' },
  { search: /#F8FAFC/g, replace: 'var(--text-primary)' },
  { search: /#94A3B8/g, replace: 'var(--text-secondary)' },
  { search: /#475569/g, replace: 'var(--text-muted)' },
  { search: /rgba\(255,255,255,0\.06\)/g, replace: 'var(--border-subtle)' },
  { search: /rgba\(255,255,255,0\.08\)/g, replace: 'var(--border-medium)' },
];

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      replacements.forEach(({ search, replace }) => {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Theme replacement complete!');
