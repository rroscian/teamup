import React, { useState } from 'react';
import { Conversation, User, UserSearchResult } from '@/shared/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ConversationListProps {
  conversations: Conversation[];
  currentUser: User;
  selectedConversation?: string;
  onSelectConversation: (conversationId: string) => void;
  onSelectUser: (user: UserSearchResult) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUser,
  selectedConversation,
  onSelectConversation,
  onSelectUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== currentUser.id)?.user;
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'event') {
      return conversation.event?.title || 'Événement';
    }
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.username || 'Conversation';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.type === 'event') {
      const participantCount = conversation.participants.length;
      return `${participantCount} participant${participantCount > 1 ? 's' : ''}`;
    }
    // Retirer l'affichage de l'email
    return '';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'event') {
      // Pour les événements, afficher une icône de groupe
      return null;
    }
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.profile?.avatar;
  };

  const getConversationInitial = (conversation: Conversation) => {
    if (conversation.type === 'event') {
      return '🏃'; // Emoji pour événement sportif
    }
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.username?.[0]?.toUpperCase() || '?';
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages?.[0];
  };

  // Recherche d'utilisateurs avec debounce
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/messages/users?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      searchUsers(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleSelectSearchUser = (user: UserSearchResult) => {
    onSelectUser(user);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Rechercher un utilisateur..."
          />
        </div>
        
        {/* Résultats de recherche */}
        {showResults && (
          <div className="absolute top-full left-4 right-4 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-3 text-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-600">
                Aucun utilisateur trouvé
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectSearchUser(user)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  {user.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            Aucune conversation
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => {
              const lastMessage = getLastMessage(conversation);
              const isSelected = selectedConversation === conversation.id;
              const title = getConversationTitle(conversation);
              const subtitle = getConversationSubtitle(conversation);
              const avatar = getConversationAvatar(conversation);
              const initial = getConversationInitial(conversation);

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full ${
                      conversation.type === 'event' 
                        ? 'bg-gradient-to-br from-green-400 to-blue-500' 
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    } flex items-center justify-center text-white font-semibold text-lg shadow-md ${avatar ? 'hidden' : ''}`}>
                      {initial}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {title}
                          </p>
                          {conversation.type === 'event' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Événement
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-900">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {subtitle}
                      </p>
                      {lastMessage && (
                        <p className="text-sm text-gray-900 truncate">
                          {lastMessage.senderId === currentUser.id && 'Vous: '}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
