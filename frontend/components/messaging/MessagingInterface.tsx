import React, { useState, useEffect, useCallback } from 'react';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MobileMessagingInterface } from './MobileMessagingInterface';
import { UserSearch } from './UserSearch';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useIsMobile } from '@/frontend/hooks/useIsMobile';
import { Conversation, Message, UserSearchResult } from '@/shared/types';

export const MessagingInterface: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        
        // Mettre à jour la liste des conversations
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [selectedConversation, loadConversations]);

  // Créer ou obtenir une conversation avec un utilisateur
  const createConversation = useCallback(async (userId: string) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const { conversationId } = await response.json();
        setSelectedConversation(conversationId);
        loadConversations();
        loadMessages(conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }, [loadConversations, loadMessages]);

  // Marquer les messages comme lus
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  // Sélectionner une conversation
  const handleSelectConversation = useCallback((conversationId: string) => {
    // Si conversationId est vide, déselectionner
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }
    
    setSelectedConversation(conversationId);
    loadMessages(conversationId, true); // Afficher le loader lors du changement de conversation
    markAsRead(conversationId);
  }, [loadMessages, markAsRead]);

  // Sélectionner un utilisateur depuis la recherche
  const handleSelectUser = useCallback((selectedUser: UserSearchResult) => {
    createConversation(selectedUser.id);
  }, [createConversation]);

  // Charger les conversations au montage
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Polling discret pour les nouveaux messages
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      // Charger sans afficher le loader pour éviter le rechargement visible
      loadMessages(selectedConversation, false);
    }, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, [selectedConversation, loadMessages]);

  if (!user) {
    return <div>Chargement...</div>;
  }

  // Interface mobile
  if (isMobile) {
    return (
      <MobileMessagingInterface
        conversations={conversations}
        selectedConversation={selectedConversation}
        messages={messages}
        loading={loading}
        onSelectConversation={handleSelectConversation}
        onSelectUser={handleSelectUser}
        onSendMessage={sendMessage}
        onLoadConversations={loadConversations}
      />
    );
  }

  // Interface desktop
  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-80 border-r">
        <ConversationList
          conversations={conversations}
          currentUser={user}
          selectedConversation={selectedConversation || undefined}
          onSelectConversation={handleSelectConversation}
          onSelectUser={handleSelectUser}
        />
      </div>

      {/* Zone de messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageList
            messages={messages}
            currentUser={user}
            onSendMessage={sendMessage}
            loading={loading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-900">
            Sélectionnez une conversation ou démarrez-en une nouvelle
          </div>
        )}
      </div>

    </div>
  );
};
