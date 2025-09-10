const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 Diagnostic PWA complet...\n');

// 1. Vérifier le manifest.json
console.log('📱 MANIFEST.JSON:');
try {
  const manifestPath = path.join(__dirname, '..', 'public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Critères obligatoires pour l'installation PWA
  const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
  const missing = required.filter(field => !manifest[field]);
  
  if (missing.length > 0) {
    console.log('❌ Champs manquants:', missing.join(', '));
  } else {
    console.log('✅ Tous les champs requis présents');
  }
  
  // Vérifier display mode
  if (manifest.display === 'standalone' || manifest.display === 'fullscreen') {
    console.log('✅ Display mode:', manifest.display);
  } else {
    console.log('⚠️  Display mode:', manifest.display, '(devrait être standalone ou fullscreen)');
  }
  
  // Vérifier les icônes
  const requiredSizes = ['192x192', '512x512'];
  const iconSizes = manifest.icons.map(icon => icon.sizes);
  const missingIcons = requiredSizes.filter(size => !iconSizes.includes(size));
  
  if (missingIcons.length > 0) {
    console.log('❌ Icônes manquantes:', missingIcons.join(', '));
  } else {
    console.log('✅ Icônes 192x192 et 512x512 présentes');
  }
  
} catch (error) {
  console.log('❌ Erreur manifest:', error.message);
}

// 2. Vérifier les fichiers d'icônes
console.log('\n🖼️  ICÔNES PNG:');
const iconSizes = [192, 512]; // Tailles critiques
iconSizes.forEach(size => {
  const iconPath = path.join(__dirname, '..', `public/icon-${size}x${size}.png`);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    if (stats.size < 1000) {
      console.log(`⚠️  icon-${size}x${size}.png trop petite (${stats.size} bytes)`);
    } else {
      console.log(`✅ icon-${size}x${size}.png valide (${Math.round(stats.size / 1024)}KB)`);
    }
  } else {
    console.log(`❌ icon-${size}x${size}.png manquante`);
  }
});

// 3. Vérifier le Service Worker
console.log('\n⚙️  SERVICE WORKER:');
const swPath = path.join(__dirname, '..', 'public/sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ sw.js présent');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Vérifier les événements essentiels
  const events = ['install', 'activate', 'fetch'];
  events.forEach(event => {
    if (swContent.includes(`addEventListener('${event}'`)) {
      console.log(`✅ Event ${event} configuré`);
    } else {
      console.log(`❌ Event ${event} manquant`);
    }
  });
} else {
  console.log('❌ sw.js manquant');
}

// 4. Vérifier la configuration Next.js
console.log('\n⚙️  CONFIGURATION NEXT.JS:');
const layoutPath = path.join(__dirname, '..', 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('manifest: "/manifest.json"')) {
    console.log('✅ Référence manifest dans layout.tsx');
  } else {
    console.log('❌ Référence manifest manquante dans layout.tsx');
  }
  
  if (layoutContent.includes('PWAInstaller')) {
    console.log('✅ Composant PWAInstaller importé');
  } else {
    console.log('⚠️  Composant PWAInstaller non importé');
  }
}

// 5. Recommandations
console.log('\n🎯 RECOMMANDATIONS:');
console.log('1. Ouvrir Chrome DevTools > Application > Manifest');
console.log('2. Vérifier qu\'aucune erreur n\'apparaît');
console.log('3. Tester sur Chrome Desktop et Mobile');
console.log('4. Forcer un Hard Refresh (Ctrl+Maj+R)');
console.log('5. Vider le cache et recommencer');

console.log('\n🔗 URLS DE TEST:');
console.log('- http://localhost:3000/manifest.json');
console.log('- http://localhost:3000/icon-192x192.png');
console.log('- http://localhost:3000/icon-512x512.png');
console.log('- http://localhost:3000/sw.js');

console.log('\n💡 CRITÈRES PWA INSTALLABLE:');
console.log('✓ HTTPS ou localhost');
console.log('✓ Service Worker enregistré'); 
console.log('✓ Manifest valide avec name, short_name, start_url');
console.log('✓ Display: standalone ou fullscreen');
console.log('✓ Icônes 192x192 et 512x512 valides');
console.log('✓ Start URL accessible');

console.log('\nSi tous les critères sont verts mais le bouton n\'apparaît pas:');
console.log('- Redémarrez Chrome complètement');
console.log('- Testez en navigation privée'); 
console.log('- Testez sur mobile (plus susceptible de montrer le bouton)');
