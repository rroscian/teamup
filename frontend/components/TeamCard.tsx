// Composant TeamCard
'use client';

import { Team } from '@/shared/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface TeamCardProps {
  team: Team;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
  onEdit?: (teamId: string) => void;
  currentUserId?: string;
  loading?: boolean;
}

export function TeamCard({ 
  team, 
  onJoin, 
  onLeave, 
  onEdit, 
  currentUserId,
  loading = false 
}: TeamCardProps) {
  const isOwner = currentUserId === team.ownerId;
  const isMember = team.members.some(member => member.userId === currentUserId);
  const memberCount = team.members.length;

  const handleAction = () => {
    if (isMember && onLeave) {
      onLeave(team.id);
    } else if (!isMember && onJoin) {
      onJoin(team.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription className="mt-1">
              {team.description || 'No description provided'}
            </CardDescription>
          </div>
          {isOwner && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Owner
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Informations sur les membres */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6" />
              </svg>
              <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Liste des membres (aperçu) */}
          {memberCount > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Members</p>
              <div className="flex -space-x-2">
                {team.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    title={member.user.name}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {member.user.name ? member.user.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {memberCount > 5 && (
                  <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{memberCount - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            {isOwner ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit?.(team.id)}
                loading={loading}
              >
                Manage Team
              </Button>
            ) : (
              <Button
                variant={isMember ? "secondary" : "primary"}
                size="sm"
                onClick={handleAction}
                loading={loading}
              >
                {isMember ? 'Leave Team' : 'Join Team'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
