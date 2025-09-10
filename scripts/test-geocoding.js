// Script de test pour vérifier la fonctionnalité de géocodage
// Usage: node scripts/test-geocoding.js

const testCities = [
  // Test avec différents formats
  { city: 'Paris', address: 'Champs-Élysées', expected: { lat: 48.8566, lng: 2.3522 } },
  { city: 'Lyon', address: 'Place Bellecour', expected: { lat: 45.7640, lng: 4.8357 } },
  { city: 'Marseille', expected: { lat: 43.2965, lng: 5.3698 } },
  { city: 'Toulouse', postalCode: '31000', expected: { lat: 43.6047, lng: 1.4442 } },
  { city: 'Nice', expected: { lat: 43.7102, lng: 7.2620 } },
  // Test avec des villes plus petites
  { city: 'Bourg-en-Bresse', expected: { lat: 46.2044, lng: 5.2265 } },
  { city: 'Vannes', expected: { lat: 47.6583, lng: -2.7603 } },
];

async function testGeocoding() {
  console.log('🧪 Test de géocodage des villes françaises\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/geocoding/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, ajouter l'en-tête d'authentification
        'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Test de géocodage réussi !');
      console.log(`📊 Résumé: ${result.summary.successful}/${result.summary.totalCities} villes géocodées (${result.summary.successRate}%)\n`);
      
      console.log('📍 Détails par ville:');
      Object.entries(result.data).forEach(([city, info]) => {
        if (info.success) {
          console.log(`  ✅ ${city}: ${info.coords.lat.toFixed(4)}, ${info.coords.lng.toFixed(4)}`);
        } else {
          console.log(`  ❌ ${city}: ${info.error}`);
        }
      });
      
      // Vérifier quelques coordonnées connues
      console.log('\n🎯 Vérification de précision:');
      const paris = result.data['Paris'];
      if (paris && paris.success) {
        const distance = calculateDistance(48.8566, 2.3522, paris.coords.lat, paris.coords.lng);
        console.log(`  Paris: Distance du centre = ${distance.toFixed(2)}km ${distance < 10 ? '✅' : '⚠️'}`);
      }
      
    } else {
      console.error('❌ Échec du test:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('💡 Assurez-vous que le serveur TeamUp est démarré sur localhost:3000');
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function testEventCreationWithGeocoding() {
  console.log('\n🏃 Test de création d\'événement avec géocodage automatique\n');
  
  const testEvent = {
    title: 'Match de Football Test',
    description: 'Test de géocodage automatique',
    sport: 'football',
    startDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
    endDate: new Date(Date.now() + 25*60*60*1000).toISOString(),
    location: {
      city: 'Lyon',
      address: 'Stade de Gerland',
      postalCode: '69007'
    },
    maxParticipants: 22,
    minParticipants: 20,
    level: 'intermediate'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(testEvent)
    });
    
    const result = await response.json();
    
    if (result.success || result.data) {
      console.log('✅ Événement créé avec géocodage automatique !');
      const event = result.data || result;
      if (event.location.latitude && event.location.longitude) {
        console.log(`📍 Coordonnées: ${event.location.latitude}, ${event.location.longitude}`);
        console.log(`🎯 Événement géolocalisé: ${event.location.city}`);
      } else {
        console.log('⚠️  Événement créé mais pas géocodé');
      }
    } else {
      console.log('⚠️  Création d\'événement échouée:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  }
}

// Lancer les tests
console.log('🚀 Démarrage des tests de géocodage TeamUp\n');

testGeocoding()
  .then(() => testEventCreationWithGeocoding())
  .then(() => {
    console.log('\n🎉 Tests terminés !');
    console.log('💡 Pour re-géocoder des événements existants, utilisez: POST /api/admin/geocoding/recode');
  })
  .catch(console.error);
