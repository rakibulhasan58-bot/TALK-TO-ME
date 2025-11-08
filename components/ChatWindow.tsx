import React, { useRef, useEffect } from 'react';
import { type Chat } from '../types';
import Message from './Message';
import MessageInput from './MessageInput';
import { MoreIcon, SearchIcon } from './icons';

interface ChatWindowProps {
  chat: Chat;
  onSendMessage: (text: string) => void;
  onSendVoiceMessage: (audioSrc: string, duration: number) => void;
  isTyping: boolean;
  onReact: (messageId: number, emoji: string) => void;
  onRetry: (messageId: number) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onSendMessage, onSendVoiceMessage, isTyping, onReact, onRetry }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chat.messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/id/1060/1600/1200?blur=2')" }}>
      {/* Chat Header */}
      <header className="flex items-center p-3 bg-[#f0f2f5] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
        <img src={chat.contact.avatar} alt={chat.contact.name} className="w-10 h-10 rounded-full mr-4" />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{chat.contact.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{isTyping ? 'typing...' : 'online'}</p>
        </div>
        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-300">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><SearchIcon /></button>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><MoreIcon /></button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-black bg-opacity-20">
        {chat.messages.map(message => (
          <Message key={message.id} message={message} onReact={(emoji) => onReact(message.id, emoji)} onRetry={() => onRetry(message.id)}/>
        ))}
         {isTyping && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-700 text-black dark:text-white rounded-lg p-2 px-3 shadow-md max-w-xs lg:max-w-md">
                   <p className="text-sm italic text-gray-600 dark:text-gray-300">typing...</p>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Message Input */}
      <footer className="p-3 bg-[#f0f2f5] dark:bg-zinc-900">
        <MessageInput onSendMessage={onSendMessage} onSendVoiceMessage={onSendVoiceMessage} />
      </footer>
    </div>
  );
};

export default ChatWindow;