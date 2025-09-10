// Service de gestion des utilisateurs
import { User as PrismaUser, UserProfile } from '@prisma/client';
import { User, CreateUserForm, UpdateProfileForm, UserRegistration, UserSportProfile } from '@/shared/types';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export class UserService {
  static async findById(id: string): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
  }

  static async findByEmail(email: string): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });
  }

  static async findAll(): Promise<(PrismaUser & { profile: UserProfile | null })[]> {
    return prisma.user.findMany({
      include: { profile: true }
    });
  }

  static async create(userData: CreateUserForm & { password?: string }): Promise<PrismaUser & { profile: UserProfile | null }> {
    const hashedPassword = await AuthService.hashPassword(userData.password || '');
    
    return prisma.user.create({
      data: {
        email: userData.email,
        username: userData.name,
        password: hashedPassword,
        profile: {
          create: {
            firstName: userData.name.split(' ')[0],
            lastName: userData.name.split(' ').slice(1).join(' '),
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            bio: '',
            location: {},
            sports: [],
            skillLevel: null,
            availability: []
          }
        }
      },
      include: { profile: true }
    });
  }

  static async register(registrationData: UserRegistration): Promise<PrismaUser & { profile: UserProfile | null }> {
    // Check if user already exists
    const existingUser = await this.findByEmail(registrationData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: registrationData.name }
    });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash the password
    const hashedPassword = await AuthService.hashPassword(registrationData.password);

    // Create user with profile
    return prisma.user.create({
      data: {
        email: registrationData.email,
        username: registrationData.name,
        password: hashedPassword,
        profile: registrationData.profile ? {
          create: {
            firstName: registrationData.name.split(' ')[0],
            lastName: registrationData.name.split(' ').slice(1).join(' '),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registrationData.email}`,
            bio: registrationData.profile.bio,
            location: registrationData.profile.location as any,
            sports: registrationData.profile.favoriteSports || [],
            skillLevel: registrationData.profile.skillLevels?.[0]?.level,
            availability: registrationData.profile.availability?.preferredTimes.map(ts => `${ts.startTime}-${ts.endTime}`) || []
          }
        } : {
          create: {
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registrationData.email}`,
            sports: [],
            availability: []
          }
        }
      },
      include: { profile: true }
    });
  }

  static async updateProfile(id: string, profileData: Partial<UserSportProfile & { enableGeolocation?: boolean; lastKnownPosition?: any }>): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    // Préparer les données de base du profil
    const baseProfileData: any = {};
    
    if (profileData.bio !== undefined) baseProfileData.bio = profileData.bio;
    if (profileData.location !== undefined) baseProfileData.location = profileData.location as any;
    if (profileData.favoriteSports !== undefined) baseProfileData.sports = profileData.favoriteSports;
    if (profileData.skillLevels !== undefined) baseProfileData.skillLevel = profileData.skillLevels?.[0]?.level;
    if (profileData.availability !== undefined) {
      baseProfileData.availability = profileData.availability?.preferredTimes?.map(ts => `${ts.startTime}-${ts.endTime}`) || [];
    }
    
    // Gestion spécifique de la géolocalisation avec tracking
    if (profileData.enableGeolocation !== undefined) {
      baseProfileData.enableGeolocation = profileData.enableGeolocation;
      
      // Logging pour le tracking des préférences de géolocalisation
      console.log(`📍 Geolocation preference updated for user ${id}: ${profileData.enableGeolocation ? 'ENABLED' : 'DISABLED'} at ${new Date().toISOString()}`);
      
      // Si on désactive la géolocalisation, vider la position
      if (!profileData.enableGeolocation) {
        baseProfileData.lastKnownPosition = null;
        console.log(`🗑️ Cleared last known position for user ${id}`);
      }
    }
    
    if (profileData.lastKnownPosition !== undefined) {
      baseProfileData.lastKnownPosition = profileData.lastKnownPosition as any;
      if (profileData.lastKnownPosition) {
        console.log(`🌍 Position updated for user ${id}: lat=${profileData.lastKnownPosition.lat}, lng=${profileData.lastKnownPosition.lng} at ${profileData.lastKnownPosition.timestamp}`);
      }
    }

    // Update or create profile
    return prisma.user.update({
      where: { id },
      data: {
        profile: {
          upsert: {
            create: {
              bio: profileData.bio,
              location: profileData.location as any,
              sports: profileData.favoriteSports || [],
              skillLevel: profileData.skillLevels?.[0]?.level,
              availability: profileData.availability?.preferredTimes?.map(ts => `${ts.startTime}-${ts.endTime}`) || [],
              enableGeolocation: profileData.enableGeolocation || false,
              lastKnownPosition: profileData.lastKnownPosition as any
            },
            update: baseProfileData
          }
        }
      },
      include: { profile: true }
    });
  }

  static async update(id: string, userData: Partial<UpdateProfileForm>): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    // Récupérer l'utilisateur existant avec son profil pour préserver les données
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateData: any = {
      email: userData.email,
      username: userData.name,
    };

    // Gestion du profil avec préservation des données existantes
    if (userData.name || userData.avatar || (userData as any).profile) {
      const existingAvatar = existingUser.profile?.avatar;
      const existingBio = existingUser.profile?.bio || '';
      const existingLocation = existingUser.profile?.location || {};
      const existingSports = existingUser.profile?.sports || [];
      const existingAvailability = existingUser.profile?.availability || [];
      
      const profileData = (userData as any).profile || {};
      
      updateData.profile = {
        upsert: {
          create: {
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            avatar: userData.avatar || existingAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email || id}`,
            bio: profileData.bio !== undefined ? profileData.bio : existingBio,
            location: profileData.location !== undefined ? profileData.location : existingLocation,
            sports: existingSports,
            availability: existingAvailability
          },
          update: {
            ...(userData.name && {
              firstName: userData.name.split(' ')[0] || '',
              lastName: userData.name.split(' ').slice(1).join(' ') || '',
            }),
            ...(userData.avatar !== undefined && { avatar: userData.avatar }),
            ...(profileData.bio !== undefined && { bio: profileData.bio }),
            ...(profileData.location !== undefined && { location: profileData.location })
          }
        }
      };
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true }
    });
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(id: string, avatarUrl: string): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    return prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: {
            avatar: avatarUrl
          }
        }
      },
      include: { profile: true }
    });
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email: string, password: string): Promise<(PrismaUser & { profile: UserProfile | null }) | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await AuthService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}

// Types spécifiques au service
