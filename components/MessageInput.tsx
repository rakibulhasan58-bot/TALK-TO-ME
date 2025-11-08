import React, { useState, useRef } from 'react';
import { EmojiIcon, AttachIcon, SendIcon, MicIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendVoiceMessage: (audioSrc: string, duration: number) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendVoiceMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // FIX: Replaced NodeJS.Timeout with 'number' for browser compatibility.
  const timerRef = useRef<number | null>(null);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onSendVoiceMessage(base64String, recordingTime);
        };
        stream.getTracks().forEach(track => track.stop()); // Release microphone
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isRecording) {
    return (
      <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300 w-full">
        <div className="flex-1 flex items-center bg-white dark:bg-zinc-700 rounded-lg px-4 py-2">
           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
           <span className="text-gray-800 dark:text-gray-200 font-mono">{formatTime(recordingTime)}</span>
        </div>
        <button onMouseUp={handleStopRecording} onMouseLeave={handleStopRecording} className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#00876a]">
            <SendIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300">
      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><EmojiIcon /></button>
      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"><AttachIcon /></button>
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
        />
      </form>
      {text ? (
         <button onClick={handleSubmit} className="bg-[#00a884] text-white p-2 rounded-full hover:bg-[#00876a]">
            <SendIcon />
        </button>
      ) : (
        <button onMouseDown={handleStartRecording} onMouseUp={handleStopRecording} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
            <MicIcon />
        </button>
      )}
    </div>
  );
};

export default MessageInput;