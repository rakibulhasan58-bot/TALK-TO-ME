import React, { useState, useRef, useEffect } from 'react';
import { type Message, MessageAuthor, MessageStatus, MessageType } from '../types';
import { EmojiIcon, SingleTickIcon, DoubleTickIcon, ErrorIcon, PlayIcon, PauseIcon } from './icons';
import ReactionPicker from './ReactionPicker';

interface MessageProps {
  message: Message;
  onReact: (emoji: string) => void;
  onRetry: () => void;
}

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<{ message: Message }> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isSent = message.author === MessageAuthor.ME;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`rounded-lg p-2 px-3 shadow-md max-w-xs lg:max-w-md flex items-center space-x-3 ${ isSent ? 'bg-[#d9fdd3] dark:bg-[#056162]' : 'bg-white dark:bg-zinc-700'}`}>
        <audio ref={audioRef} src={message.audioSrc} preload="metadata"></audio>
        <button onClick={togglePlay} className="text-gray-600 dark:text-gray-200">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="flex-grow">
            <div className="w-full bg-gray-300 dark:bg-zinc-500 rounded-full h-1">
                <div className="bg-[#00a884] h-1 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
          {isPlaying ? formatTime(currentTime) : formatTime(message.duration || 0)}
        </div>
    </div>
  );
}


const Message: React.FC<MessageProps> = ({ message, onReact, onRetry }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerVisible(false);
      }
    };
    if (isPickerVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerVisible]);

  const handleEmojiSelect = (emoji: string) => {
    onReact(emoji);
    setPickerVisible(false);
  };

  const isSent = message.author === MessageAuthor.ME;
  const hasReactions = message.reactions && message.reactions.length > 0;

  return (
    <div className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative group ${hasReactions ? 'mb-5' : ''}`}>
        
        {isPickerVisible && (
          <div ref={pickerRef} className={`absolute z-10 ${isSent ? 'right-0' : 'left-0'} -top-12`}>
            <ReactionPicker onSelect={handleEmojiSelect} />
          </div>
        )}

        {message.type === MessageType.TEXT && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${isSent ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center`}>
            <button
              onClick={() => setPickerVisible(v => !v)}
              className="p-1.5 rounded-full bg-white dark:bg-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-500 shadow-md"
              aria-label="Add reaction"
            >
              <div className="w-5 h-5 text-gray-500 dark:text-gray-300">
                <EmojiIcon />
              </div>
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
           {message.type === MessageType.TEXT ? (
              <div
                className={`rounded-lg p-2 px-3 shadow-md max-w-xs lg:max-w-md flex items-end space-x-2 ${
                  isSent
                    ? 'bg-[#d9fdd3] dark:bg-[#056162]'
                    : 'bg-white dark:bg-zinc-700'
                }`}
              >
                <p className="text-black dark:text-white break-words">{message.text}</p>
              </div>
           ) : (
             <AudioPlayer message={message} />
           )}
           <div className="flex items-center self-end shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{message.timestamp}</span>
            {isSent && (
              <span className="ml-1">
                {message.status === MessageStatus.FAILED && (
                   <button onClick={onRetry} aria-label="Retry sending message"><ErrorIcon /></button>
                )}
                {message.status === MessageStatus.READ && <DoubleTickIcon />}
                {message.status === MessageStatus.SENT && <SingleTickIcon />}
              </span>
            )}
          </div>
        </div>

        {hasReactions && (
          <div className={`absolute ${isSent ? 'right-2' : 'left-2'} -bottom-3 flex items-center space-x-1`}>
            {message.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={`px-1.5 py-0.5 rounded-full text-xs flex items-center shadow transition-transform transform hover:scale-110 ${
                  r.byMe
                    ? 'bg-blue-200 dark:bg-blue-600 border border-blue-400 dark:border-blue-500'
                    : 'bg-white dark:bg-zinc-600 border border-gray-200 dark:border-zinc-500'
                }`}
                aria-label={`React with ${r.emoji}`}
              >
                <span className="text-sm">{r.emoji}</span>
                {r.count > 1 && <span className="ml-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{r.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;