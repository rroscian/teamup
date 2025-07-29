// Script pour initialiser des données d'exemple
// Utilisable pour tester l'application

import { UserService } from '../backend/services/userService';
import { TeamService } from '../backend/services/teamService';

export async function seedData() {
  console.log('🌱 Initialisation des données d\'exemple...');

  try {
    // Créer des utilisateurs d'exemple
    const users = [
      {
        name: 'Alice Martin',
        email: 'alice.martin@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      },
      {
        name: 'Bob Dubois',
        email: 'bob.dubois@example.com', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      },
      {
        name: 'Claire Durand',
        email: 'claire.durand@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=claire',
      },
      {
        name: 'David Rousseau',
        email: 'david.rousseau@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      }
    ];

    console.log('👥 Création des utilisateurs...');
    for (const userData of users) {
      await UserService.create(userData);
    }

    // Créer des équipes d'exemple
    const teams = [
      {
        name: 'Équipe Frontend',
        description: 'Développement de l\'interface utilisateur et expérience utilisateur',
        ownerId: '1', // Alice
      },
      {
        name: 'Équipe Backend', 
        description: 'Développement des APIs et architecture serveur',
        ownerId: '2', // Bob
      },
      {
        name: 'Équipe Design',
        description: 'Design système et expérience utilisateur',
        ownerId: '3', // Claire
      }
    ];

    console.log('🏆 Création des équipes...');
    for (const teamData of teams) {
      await TeamService.create(teamData.ownerId, {
        name: teamData.name,
        description: teamData.description
      });
    }

    // Ajouter des membres aux équipes
    console.log('🤝 Ajout de membres aux équipes...');
    
    // Équipe Frontend (Alice propriétaire)
    await TeamService.addMember('1', '2'); // Bob rejoint Frontend
    await TeamService.addMember('1', '4'); // David rejoint Frontend
    
    // Équipe Backend (Bob propriétaire) 
    await TeamService.addMember('2', '1'); // Alice rejoint Backend
    await TeamService.addMember('2', '3'); // Claire rejoint Backend
    
    // Équipe Design (Claire propriétaire)
    await TeamService.addMember('3', '4'); // David rejoint Design

    console.log('✅ Données d\'exemple créées avec succès !');
    console.log('📊 Résumé :');
    console.log(`   • ${users.length} utilisateurs créés`);
    console.log(`   • ${teams.length} équipes créées`);
    console.log(`   • Membres ajoutés aux équipes`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données :', error);
  }
}

// Exporter pour utilisation dans l'API
export default seedData;
