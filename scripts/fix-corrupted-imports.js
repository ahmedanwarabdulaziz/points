const fs = require('fs');
const path = require('path');

// Files that were corrupted by the previous script
const filesToFix = [
  'src/app/admin-setup/page.tsx',
  'src/app/business-customers/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/gift-cards/page.tsx',
  'src/app/how-it-works/page.tsx',
  'src/app/qr-display/page.tsx',
  'src/app/qr-signup/page.tsx',
  'src/app/rewards/page.tsx',
  'src/app/scan-qr/page.tsx',
  'src/app/signin/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/test-auth/page.tsx',
  'src/components/CustomerClassManager.tsx',
  'src/components/Header.tsx',
  'src/components/Sidebar.tsx',
  'src/contexts/AuthContext.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix corrupted import statements by replacing &apos; with single quotes
    content = content.replace(/&apos;/g, "'");
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing corrupted import statements...\n');

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Import statement fixes completed!');
