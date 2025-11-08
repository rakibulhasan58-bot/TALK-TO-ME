import React from 'react';
import { type Chat, MessageType } from '../types';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isSelected, onClick }) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

  const getLastMessagePreview = () => {
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.type === MessageType.AUDIO) return '🎤 Voice message';
    return lastMessage.text || '';
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200 ${
        isSelected ? 'bg-gray-200 dark:bg-zinc-700' : ''
      }`}
    >
      <img src={chat.contact.avatar} alt={chat.contact.name} className="w-12 h-12 rounded-full mr-4" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{chat.contact.name}</h3>
          <p className={`text-xs ${isSelected ? 'text-[#00a884]' : 'text-gray-500 dark:text-gray-400'}`}>
            {lastMessage?.timestamp}
          </p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {getLastMessagePreview()}
        </p>
      </div>
    </div>
  );
};

export default ChatListItem;