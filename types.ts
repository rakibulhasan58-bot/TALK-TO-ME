export interface User {
  id: number;
  name: string;
  avatar: string;
}

export enum MessageAuthor {
  ME,
  THEM,
}

export enum MessageStatus {
  SENT,
  READ,
  FAILED,
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
}

export interface Reaction {
  emoji: string;
  count: number;
  byMe: boolean;
}

export interface Message {
  id: number;
  author: MessageAuthor;
  timestamp: string;
  type: MessageType;

  // Text properties
  text?: string;
  reactions?: Reaction[];

  // Audio properties
  audioSrc?: string;
  duration?: number; // in seconds

  // Status
  status?: MessageStatus;
}

export interface Chat {
  id: number;
  contact: User;
  messages: Message[];
}

export type CallStatus = 'idle' | 'connecting' | 'connected' | 'ended';

export interface TranscriptionTurn {
  author: MessageAuthor;
  text: string;
}
