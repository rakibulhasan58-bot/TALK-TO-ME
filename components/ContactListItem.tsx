import React from 'react';
import { type User } from '../types';

interface ContactListItemProps {
  contact: User;
  onClick: () => void;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200 border-b border-gray-200 dark:border-zinc-700"
    >
      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{contact.name}</h3>
      </div>
    </div>
  );
};

export default ContactListItem;
