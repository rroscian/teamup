// Script pour forcer le géocodage de tous les événements
// Usage: node scripts/force-geocode-all.js

async function forceGeocodeAllEvents() {
  console.log('🚀 Démarrage du géocodage forcé de tous les événements...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/geocoding/force-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Remplacer par votre token d'authentification en production
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Géocodage forcé terminé avec succès !\n');
      
      console.log('📊 Résumé:');
      console.log(`  • Total d'événements: ${result.data.total}`);
      console.log(`  • Déjà géocodés: ${result.data.alreadyGeocoded}`);
      console.log(`  • Traités: ${result.data.processed}`);
      console.log(`  • Succès: ${result.data.successful}`);
      console.log(`  • Échecs: ${result.data.failed}`);
      console.log(`  • Taux de succès: ${result.data.successRate}%\n`);
      
      if (result.data.details && result.data.details.length > 0) {
        console.log('📍 Détails par événement:');
        result.data.details.forEach(detail => {
          if (detail.success) {
            console.log(`  ✅ ${detail.event} (${detail.city}): ${detail.coords.lat.toFixed(4)}, ${detail.coords.lng.toFixed(4)}`);
          } else {
            console.log(`  ❌ ${detail.event} (${detail.city}): ${detail.error}`);
          }
        });
      }
      
      console.log('\n🎉 Géocodage terminé ! Les événements peuvent maintenant être trouvés par proximité.');
      
    } else {
      console.error('❌ Échec du géocodage forcé:', result.error);
      if (result.details) {
        console.error('Détails:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du géocodage forcé:', error.message);
    console.log('\n💡 Vérifications à effectuer:');
    console.log('  1. Le serveur TeamUp est-il démarré sur localhost:3000 ?');
    console.log('  2. Avez-vous les permissions d\'administration ?');
    console.log('  3. La base de données est-elle accessible ?');
  }
}

async function testNearbySearch() {
  console.log('\n🔍 Test de la recherche par proximité...');
  
  // Coordonnées de Paris pour le test
  const testLat = 48.8566;
  const testLng = 2.3522;
  const testRadius = 50; // 50km autour de Paris
  
  try {
    const response = await fetch(`http://localhost:3000/api/events/nearby?lat=${testLat}&lng=${testLng}&radius=${testRadius}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ Recherche par proximité fonctionnelle !`);
      console.log(`📍 ${result.data.length} événements trouvés dans un rayon de ${testRadius}km autour de Paris\n`);
      
      if (result.data.length > 0) {
        console.log('🎯 Premiers événements trouvés:');
        result.data.slice(0, 5).forEach(event => {
          console.log(`  • ${event.title} à ${event.location.city} (${event.distance}km)`);
        });
        
        console.log('\n✅ Le géocodage fonctionne correctement !');
      } else {
        console.log('ℹ️  Aucun événement trouvé dans la zone de test, mais la recherche fonctionne.');
      }
      
    } else {
      console.log('⚠️  Réponse inattendue:', result);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de proximité:', error.message);
  }
}

// Script principal
async function main() {
  console.log('🌍 Script de correction du géocodage TeamUp\n');
  
  // Étape 1: Forcer le géocodage de tous les événements
  await forceGeocodeAllEvents();
  
  // Étape 2: Tester que la recherche par proximité fonctionne
  await testNearbySearch();
  
  console.log('\n🎯 Correction terminée !');
  console.log('Les événements sont maintenant géolocalisés et peuvent être trouvés par proximité.');
}

main().catch(console.error);
