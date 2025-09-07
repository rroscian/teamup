import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '@/shared/types';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onSendMessage,
  loading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-900 mt-8">
            Aucun message pour le moment. Commencez la conversation !
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser.id;
            const senderName = message.sender?.username || 'Utilisateur';
            const messageDate = new Date(message.createdAt);
            const hoursAgo = differenceInHours(new Date(), messageDate);
            
            // Format de l'heure : relatif si < 24h, date/heure complète si >= 24h
            const timeFormat = hoursAgo < 24 
              ? formatDistanceToNow(messageDate, { addSuffix: true, locale: fr })
              : format(messageDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start space-x-2`}
              >
                {/* Photo de profil pour les messages des autres utilisateurs */}
                {!isCurrentUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {message.sender?.profile?.avatar ? (
                      <Image
                        src={message.sender.profile.avatar}
                        alt={senderName}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                        onError={(e) => {
                          // Fallback vers la première lettre en cas d'erreur
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-sm font-medium text-gray-600">${senderName[0].toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {senderName[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* Conteneur du message avec pseudo + heure au-dessus */}
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                  {/* Pseudo et heure au-dessus de la bulle */}
                  {!isCurrentUser && (
                    <div className="flex items-center space-x-2 mb-1 px-1">
                      <span className="text-sm font-medium text-gray-700">{senderName}</span>
                      <span className="text-xs text-gray-500">{timeFormat}</span>
                    </div>
                  )}

                  {/* Bulle de message */}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {/* Heure pour les messages de l'utilisateur actuel */}
                    {isCurrentUser && (
                      <p className="text-xs mt-1 text-indigo-200">
                        {timeFormat}
                      </p>
                    )}
                  </div>
                </div>

                {/* Espace pour l'alignement des messages de l'utilisateur actuel */}
                {isCurrentUser && <div className="w-8 h-8 flex-shrink-0" />}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};
