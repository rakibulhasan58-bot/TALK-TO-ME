import React, { useState } from 'react';
import { type Chat, type User } from '../types';
import ChatListItem from './ChatListItem';
import ContactListItem from './ContactListItem';
import { MoreIcon, NewChatIcon, StatusIcon, SearchIcon, ArrowLeftIcon, CallIcon } from './icons';

interface SidebarProps {
  chats: Chat[];
  contacts: User[];
  selectedChatId: number | null;
  onSelectChat: (id: number) => void;
  view: 'chats' | 'contacts';
  onSetView: (view: 'chats' | 'contacts') => void;
  onStartNewChat: (contact: User) => void;
  onStartCall: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, contacts, selectedChatId, onSelectChat, view, onSetView, onStartNewChat, onStartCall }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredChats = chats.filter(chat =>
      chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.messages.some(msg => msg.text && msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (view === 'contacts') {
    return (
      <div className="w-full sm:w-[30%] min-w-[300px] border-r border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col">
        {/* New Chat Header */}
        <header className="flex items-center p-3 pt-16 bg-[#00a884] text-white">
          <button onClick={() => onSetView('chats')} className="mr-4 p-2 rounded-full hover:bg-white/20">
            <ArrowLeftIcon />
          </button>
          <h2 className="text-xl font-semibold">New Chat</h2>
        </header>

        {/* Search Bar */}
        <div className="p-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search contacts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-[#f0f2f5] dark:bg-zinc-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              onClick={() => onStartNewChat(contact)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[30%] min-w-[300px] border-r border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col">
      {/* Sidebar Header */}
      <header className="flex items-center justify-between p-3 bg-[#f0f2f5] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
        <img src="https://picsum.photos/seed/my-profile/40" alt="My Profile" className="w-10 h-10 rounded-full" />
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-300">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><StatusIcon /></button>
          <button onClick={() => onStartCall()} disabled={!selectedChatId} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"><CallIcon /></button>
          <button onClick={() => { setSearchTerm(''); onSetView('contacts'); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><NewChatIcon /></button>
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><MoreIcon /></button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-2 bg-[#f0f2f5] dark:bg-zinc-900">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === selectedChatId}
            onClick={() => onSelectChat(chat.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;