// Service de géocodage pour convertir les adresses en coordonnées
export class GeocodingService {
  private static readonly NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly USER_AGENT = 'TeamUp/1.0';

  /**
   * Géocode une adresse en coordonnées GPS avec stratégie de fallback
   */
  static async geocodeAddress(
    address: string,
    city: string,
    postalCode?: string,
    country: string = 'France'
  ): Promise<{ lat: number; lng: number } | null> {
    try {      
      // Stratégie 1: Requête complète avec adresse
      let coords = await this.tryGeocode([
        address,
        postalCode,
        city,
        country
      ].filter(Boolean).join(', '));

      if (coords) {
        return coords;
      }

      // Stratégie 2: Ville + code postal + pays seulement
      if (postalCode) {
        coords = await this.tryGeocode([
          postalCode,
          city,
          country
        ].filter(Boolean).join(', '));

        if (coords) {
          return coords;
        }
      }

      // Stratégie 3: Ville + pays seulement
      coords = await this.tryGeocode([
        city,
        country
      ].filter(Boolean).join(', '));

      if (coords) {
        return coords;
      }

      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  }

  /**
   * Essayer une requête de géocodage unique
   */
  private static async tryGeocode(searchQuery: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = new URL(this.NOMINATIM_API_URL);
      url.searchParams.append('q', searchQuery);
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', '3'); // Augmenté pour avoir plus d'options
      url.searchParams.append('addressdetails', '1');
      
      // Permettre plus de pays, pas seulement la France
      if (searchQuery.toLowerCase().includes('france')) {
        url.searchParams.append('countrycodes', 'fr');
      }

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ API géocodage erreur ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        // Prendre le meilleur résultat (importance la plus élevée)
        const result = data.reduce((best: any, current: any) => {
          const bestImportance = parseFloat(best.importance || '0');
          const currentImportance = parseFloat(current.importance || '0');
          return currentImportance > bestImportance ? current : best;
        });
        
        const coords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        
        return coords;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la requête géocodage:', error);
      return null;
    }
  }

  /**
   * Géocode plusieurs adresses en batch
   */
  static async geocodeBatch(
    locations: Array<{
      address: string;
      city: string;
      postalCode?: string;
    }>
  ): Promise<Map<string, { lat: number; lng: number }>> {
    const results = new Map<string, { lat: number; lng: number }>();
    
    // Limiter le nombre de requêtes parallèles pour respecter les limites de l'API
    const batchSize = 5;
    const delay = 1000; // 1 seconde entre chaque batch
    
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      const promises = batch.map(async (location) => {
        const coords = await this.geocodeAddress(
          location.address,
          location.city,
          location.postalCode
        );
        
        if (coords) {
          const key = `${location.address}, ${location.city}`;
          results.set(key, coords);
        }
      });
      
      await Promise.all(promises);
      
      // Attendre avant le prochain batch pour éviter de surcharger l'API
      if (i + batchSize < locations.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * Calculer la distance entre deux points GPS (en kilomètres)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Formater la distance pour l'affichage
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km`;
    } else {
      return `${Math.round(distance)} km`;
    }
  }
}
