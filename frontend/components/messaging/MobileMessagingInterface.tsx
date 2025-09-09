import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useSwipeGesture } from '@/frontend/hooks/useSwipeGesture';
import { Conversation, Message, UserSearchResult } from '@/shared/types';
import { ChevronLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface MobileMessagingInterfaceProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  messages: Message[];
  loading: boolean;
  onSelectConversation: (conversationId: string) => void;
  onSelectUser: (user: UserSearchResult) => void;
  onSendMessage: (content: string) => void;
  onLoadConversations: () => void;
}

export const MobileMessagingInterface: React.FC<MobileMessagingInterfaceProps> = ({
  conversations,
  selectedConversation,
  messages,
  loading,
  onSelectConversation,
  onSelectUser,
  onSendMessage,
  onLoadConversations
}) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'conversations' | 'chat'>('conversations');
  const containerRef = useRef<HTMLDivElement>(null);

  // Gérer le balayage pour navigation simple
  const { attachSwipeListeners } = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentView === 'chat') {
        setCurrentView('conversations');
      }
    },
    threshold: 50
  });

  // Attacher les listeners de balayage
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const cleanup = attachSwipeListeners(container);
      return cleanup;
    }
    return undefined;
  }, [attachSwipeListeners]);

  // Gérer la sélection d'une conversation
  const handleSelectConversation = useCallback((conversationId: string) => {
    onSelectConversation(conversationId);
    setCurrentView('chat');
  }, [onSelectConversation]);

  // Retour vers la liste des conversations
  const handleBackToConversations = () => {
    setCurrentView('conversations');
    // Déselectionner la conversation pour arrêter le polling
    onSelectConversation('');
  };

  // Obtenir le titre de la conversation actuelle
  const getCurrentConversationTitle = (): string => {
    if (!selectedConversation) return '';
    
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return '';

    if (conversation.type === 'event') {
      return conversation.event?.title || 'Événement';
    }
    
    const otherUser = conversation.participants.find(p => p.userId !== user?.id)?.user;
    return otherUser?.username || 'Conversation';
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-full bg-white overflow-hidden"
    >
      {/* Vue des conversations (mobile-first) */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
        currentView === 'conversations' ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* En-tête des conversations */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h1 className="text-lg font-semibold text-gray-900">Messagerie</h1>
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              currentUser={user}
              selectedConversation={selectedConversation || undefined}
              onSelectConversation={handleSelectConversation}
              onSelectUser={onSelectUser}
            />
          </div>
        </div>
      </div>

      {/* Vue du chat */}
      <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
        currentView === 'chat' ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* En-tête du chat avec bouton retour */}
            <div className="flex items-center p-4 border-b bg-white">
              <button
                onClick={handleBackToConversations}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 flex-1 truncate">
                {getCurrentConversationTitle()}
              </h2>
            </div>

            {/* Zone de messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                currentUser={user}
                onSendMessage={onSendMessage}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center p-4 border-b bg-white">
              <button
                onClick={handleBackToConversations}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg mb-2">Aucune conversation sélectionnée</p>
                <p className="text-sm">Retournez à la liste des conversations pour en démarrer une</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
