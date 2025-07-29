// Service de gestion des utilisateurs
import { User, CreateUserForm, UpdateProfileForm, UserRegistration, UserSportProfile } from '@/shared/types';

export class UserService {
  // Simule une base de données en mémoire pour la démo
  private static users: User[] = [];

  static async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  static async findAll(): Promise<User[]> {
    return [...this.users];
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: String(Date.now()), // Use timestamp for unique ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  static async register(registrationData: UserRegistration): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(registrationData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user with profile
    const newUser: User = {
      id: String(Date.now()),
      email: registrationData.email,
      name: registrationData.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registrationData.email}`,
      profile: registrationData.profile ? {
        favoriteSports: registrationData.profile.favoriteSports || [],
        skillLevels: registrationData.profile.skillLevels || [],
        availability: {
          weekdays: [],
          preferredTimes: []
        },
        bio: registrationData.profile.bio,
        location: registrationData.profile.location,
        notifications: {
          events: true,
          messages: true,
          reminders: true
        }
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  static async updateProfile(id: string, profileData: Partial<UserSportProfile>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    // Merge profile data
    const currentProfile = this.users[userIndex].profile || {
      favoriteSports: [],
      skillLevels: [],
      availability: {
        weekdays: [],
        preferredTimes: []
      }
    };

    this.users[userIndex] = {
      ...this.users[userIndex],
      profile: {
        ...currentProfile,
        ...profileData
      },
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  static async update(id: string, userData: Partial<UpdateProfileForm>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

// Types spécifiques au service
