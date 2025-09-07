// Service de gestion des équipes
import { Team, TeamMember, CreateTeamForm, User } from '@/shared/types';
import { UserService } from './userService';

export class TeamService {
  // Simule une base de données en mémoire pour la démo
  private static teams: Team[] = [
    {
      id: '1',
      name: 'Équipe Alpha',
      description: 'Équipe de développement frontend',
      ownerId: '1',
      members: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  private static members: TeamMember[] = [
    {
      id: '1',
      userId: '1',
      teamId: '1',
      role: 'owner',
      joinedAt: new Date('2024-01-15'),
      user: { id: '', email: '', name: '', username: '', createdAt: new Date(), updatedAt: new Date() } as User, // Will be populated by populateUserData
    },
  ];

  static async findById(id: string): Promise<Team | null> {
    const team = this.teams.find(team => team.id === id);
    if (team) {
      await this.populateTeamMembers(team);
    }
    return team || null;
  }

  static async findAll(): Promise<Team[]> {
    const teamsWithMembers = await Promise.all(
      this.teams.map(async (team) => {
        await this.populateTeamMembers(team);
        return team;
      })
    );
    return teamsWithMembers;
  }

  static async findByUserId(userId: string): Promise<Team[]> {
    const userTeamIds = this.members
      .filter(member => member.userId === userId)
      .map(member => member.teamId);
    
    const teams = this.teams.filter(team => userTeamIds.includes(team.id));
    
    // Populate members for each team
    await Promise.all(teams.map(team => this.populateTeamMembers(team)));
    
    return teams;
  }

  static async create(ownerId: string, teamData: CreateTeamForm): Promise<Team> {
    const newTeam: Team = {
      ...teamData,
      id: String(this.teams.length + 1),
      ownerId,
      members: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Ajouter le propriétaire comme membre
    const ownerMember: TeamMember = {
      id: String(this.members.length + 1),
      userId: ownerId,
      teamId: newTeam.id,
      role: 'owner',
      joinedAt: new Date(),
      user: { id: '', email: '', name: '', username: '', createdAt: new Date(), updatedAt: new Date() } as User,
    };

    this.teams.push(newTeam);
    this.members.push(ownerMember);

    await this.populateTeamMembers(newTeam);
    return newTeam;
  }

  static async addMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const team = await this.findById(teamId);
    const user = await UserService.findById(userId);
    
    if (!team || !user) {
      return null;
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = this.members.find(
      member => member.teamId === teamId && member.userId === userId
    );
    
    if (existingMember) {
      return null;
    }

    const newMember: TeamMember = {
      id: String(this.members.length + 1),
      userId,
      teamId,
      role: 'member',
      joinedAt: new Date(),
      user: {
        id: user.id,
        email: user.email,
        name: user.username, // Map username to name for type compatibility
        username: user.username,
        avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        profile: user.profile ? {
          favoriteSports: user.profile.sports as import('../../shared/types').Sport[],
          skillLevels: user.profile.skillLevel ? [{
            sport: user.profile.sports[0] as import('../../shared/types').Sport || 'football',
            level: user.profile.skillLevel as import('../../shared/types').SkillLevel
          }] : [],
          availability: {
            weekdays: [],
            preferredTimes: user.profile.availability.map((avail: string) => {
              const [startTime, endTime] = avail.split('-');
              return { startTime, endTime };
            })
          },
          bio: user.profile.bio || undefined,
          location: user.profile.location ? {
            city: typeof user.profile.location === 'string' ? user.profile.location : (user.profile.location as { city: string; postalCode?: string }).city,
            postalCode: typeof user.profile.location === 'object' ? (user.profile.location as { city: string; postalCode?: string }).postalCode : undefined
          } : undefined,
          notifications: {
            events: true,
            messages: true,
            reminders: true
          }
        } : undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    };

    this.members.push(newMember);
    return newMember;
  }

  static async removeMember(teamId: string, userId: string): Promise<boolean> {
    const memberIndex = this.members.findIndex(
      member => member.teamId === teamId && member.userId === userId
    );
    
    if (memberIndex === -1) {
      return false;
    }

    this.members.splice(memberIndex, 1);
    return true;
  }

  static async update(id: string, teamData: Partial<CreateTeamForm>): Promise<Team | null> {
    const teamIndex = this.teams.findIndex(team => team.id === id);
    
    if (teamIndex === -1) {
      return null;
    }

    this.teams[teamIndex] = {
      ...this.teams[teamIndex],
      ...teamData,
      updatedAt: new Date(),
    };

    await this.populateTeamMembers(this.teams[teamIndex]);
    return this.teams[teamIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const teamIndex = this.teams.findIndex(team => team.id === id);
    
    if (teamIndex === -1) {
      return false;
    }

    // Supprimer tous les membres de l'équipe
    this.members = this.members.filter(member => member.teamId !== id);
    
    // Supprimer l'équipe
    this.teams.splice(teamIndex, 1);
    return true;
  }

  private static async populateTeamMembers(team: Team): Promise<void> {
    const teamMembers = this.members.filter(member => member.teamId === team.id);
    
    for (const member of teamMembers) {
      const user = await UserService.findById(member.userId);
      if (user) {
        member.user = {
          id: user.id,
          email: user.email,
          name: user.username, // Map username to name for type compatibility
          username: user.username,
          avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          profile: user.profile ? {
            favoriteSports: user.profile.sports as import('../../shared/types').Sport[],
            skillLevels: user.profile.skillLevel ? [{
              sport: user.profile.sports[0] as import('../../shared/types').Sport || 'football',
              level: user.profile.skillLevel as import('../../shared/types').SkillLevel
            }] : [],
            availability: {
              weekdays: [],
              preferredTimes: user.profile.availability.map((avail: string) => {
                const [startTime, endTime] = avail.split('-');
                return { startTime, endTime };
              })
            },
            bio: user.profile.bio || undefined,
            location: user.profile.location ? {
              city: typeof user.profile.location === 'string' ? user.profile.location : (user.profile.location as { city: string; postalCode?: string }).city,
              postalCode: typeof user.profile.location === 'object' ? (user.profile.location as { city: string; postalCode?: string }).postalCode : undefined
            } : undefined,
            notifications: {
              events: true,
              messages: true,
              reminders: true
            }
          } : undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }
    }
    
    team.members = teamMembers;
  }
}
