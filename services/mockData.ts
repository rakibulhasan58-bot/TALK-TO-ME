import { type Chat, type User, MessageAuthor, MessageStatus, MessageType } from '../types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Alex', avatar: 'https://picsum.photos/seed/alex/200' },
  { id: 2, name: 'Mia', avatar: 'https://picsum.photos/seed/mia/200' },
  { id: 3, name: 'Sam', avatar: 'https://picsum.photos/seed/sam/200' },
  { id: 4, name: 'Chloe', avatar: 'https://picsum.photos/seed/chloe/200' },
  { id: 5, name: 'David', avatar: 'https://picsum.photos/seed/david/200' },
  { id: 6, name: 'Zoe', avatar: 'https://picsum.photos/seed/zoe/200' },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    contact: MOCK_USERS[0],
    messages: [
       { id: 1, text: "Let's start our conversation!", author: MessageAuthor.ME, timestamp: '10:00 AM', status: MessageStatus.SENT, type: MessageType.TEXT },
    ],
  },
  {
    id: 2,
    contact: MOCK_USERS[1],
    messages: [
      { id: 1, text: 'Are we still on for lunch tomorrow?', author: MessageAuthor.THEM, timestamp: 'Yesterday', type: MessageType.TEXT },
      { 
        id: 2, 
        text: 'Yes, absolutely! Can\'t wait. Same place?', 
        author: MessageAuthor.ME, 
        timestamp: 'Yesterday',
        reactions: [{ emoji: '👍', count: 1, byMe: false }],
        status: MessageStatus.READ,
        type: MessageType.TEXT,
      },
      { 
        id: 3, 
        text: 'Perfect!', 
        author: MessageAuthor.THEM, 
        timestamp: 'Yesterday',
        reactions: [{ emoji: '❤️', count: 1, byMe: true }],
        type: MessageType.TEXT,
      },
    ],
  },
  {
    id: 3,
    contact: MOCK_USERS[2],
    messages: [
      { id: 1, text: 'Just saw the final project report. Looks amazing!', author: MessageAuthor.THEM, timestamp: 'Yesterday', type: MessageType.TEXT },
      { id: 2, text: 'Thanks! Couldn\'t have done it without the team.', author: MessageAuthor.ME, timestamp: 'Yesterday', status: MessageStatus.SENT, type: MessageType.TEXT },
    ],
  },
  {
    id: 4,
    contact: MOCK_USERS[3],
    messages: [
      { id: 1, text: 'Happy Birthday!! 🎂 Hope you have a great day.', author: MessageAuthor.THEM, timestamp: 'Yesterday', type: MessageType.TEXT },
    ],
  },
   {
    id: 5,
    contact: MOCK_USERS[4],
    messages: [
      { id: 1, text: 'Can you send me the files from the meeting?', author: MessageAuthor.ME, timestamp: '2 days ago', status: MessageStatus.SENT, type: MessageType.TEXT },
    ],
  },
  {
    id: 6,
    contact: MOCK_USERS[5],
    messages: [
      { id: 1, text: 'Movie night this weekend?', author: MessageAuthor.THEM, timestamp: '2 days ago', type: MessageType.TEXT },
    ],
  },
];