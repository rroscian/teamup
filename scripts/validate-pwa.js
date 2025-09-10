const fs = require('fs');
const path = require('path');

console.log('🔍 Validation PWA TeamUp...\n');

// Vérifier les fichiers essentiels
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/icon-192x192.svg',
  'public/icon-512x512.svg'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '(MANQUANT)');
    allFilesExist = false;
  }
});

// Vérifier le manifest.json
try {
  const manifestPath = path.join(__dirname, '..', 'public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('\n📱 Validation Manifest:');
  console.log('✅ name:', manifest.name);
  console.log('✅ short_name:', manifest.short_name);
  console.log('✅ start_url:', manifest.start_url);
  console.log('✅ display:', manifest.display);
  console.log('✅ icons:', manifest.icons.length + ' icônes');
  
  // Vérifier les tailles d'icônes requises
  const requiredSizes = ['192x192', '512x512'];
  const availableSizes = manifest.icons.map(icon => icon.sizes);
  
  requiredSizes.forEach(size => {
    if (availableSizes.includes(size)) {
      console.log('✅ Icône', size);
    } else {
      console.log('⚠️  Icône', size, 'manquante');
    }
  });
  
} catch (error) {
  console.log('❌ Erreur manifest.json:', error.message);
}

// Vérifier le Service Worker
try {
  const swPath = path.join(__dirname, '..', 'public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  console.log('\n⚙️ Validation Service Worker:');
  console.log('✅ Taille:', Math.round(swContent.length / 1024) + 'KB');
  
  if (swContent.includes("addEventListener('install'")) {
    console.log('✅ Event listener install');
  }
  
  if (swContent.includes("addEventListener('activate'")) {
    console.log('✅ Event listener activate');
  }
  
  if (swContent.includes("addEventListener('fetch'")) {
    console.log('✅ Event listener fetch');
  }
  
  if (swContent.includes('caches.open')) {
    console.log('✅ Cache API');
  }
  
} catch (error) {
  console.log('❌ Erreur Service Worker:', error.message);
}

// Vérifier le layout.tsx
try {
  const layoutPath = path.join(__dirname, '..', 'app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  console.log('\n🎨 Validation Layout:');
  
  if (layoutContent.includes('manifest: "/manifest.json"')) {
    console.log('✅ Référence manifest');
  } else {
    console.log('⚠️  Référence manifest manquante');
  }
  
  if (layoutContent.includes('PWAInstaller')) {
    console.log('✅ Composant PWAInstaller');
  } else {
    console.log('⚠️  Composant PWAInstaller manquant');
  }
  
  if (layoutContent.includes('OfflineIndicator')) {
    console.log('✅ Composant OfflineIndicator');
  } else {
    console.log('⚠️  Composant OfflineIndicator manquant');
  }
  
} catch (error) {
  console.log('❌ Erreur layout.tsx:', error.message);
}

console.log('\n🎯 Résultat de validation:');
if (allFilesExist) {
  console.log('✅ TOUS LES FICHIERS PWA SONT PRÉSENTS');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. npm run build');
  console.log('2. npm start');
  console.log('3. Tester sur https://localhost:3000');
  console.log('4. Ouvrir DevTools > Application > Manifest');
  console.log('5. Vérifier "Add to Home Screen" disponible');
} else {
  console.log('❌ CERTAINS FICHIERS PWA SONT MANQUANTS');
}

console.log('\n🔗 URLs de test:');
console.log('- Manifest: /manifest.json');
console.log('- Service Worker: /sw.js');
console.log('- Icônes: /icon-192x192.svg, /icon-512x512.svg');
