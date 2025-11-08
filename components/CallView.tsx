import React, { useEffect, useRef } from 'react';
import { type User, type CallStatus, type TranscriptionTurn, MessageAuthor } from '../types';
import { EndCallIcon } from './icons';

interface CallViewProps {
  contact: User;
  status: CallStatus;
  onEndCall: () => void;
  transcriptionHistory: TranscriptionTurn[];
  currentTurn: { userInput: string; modelOutput: string; };
}

const getStatusText = (status: CallStatus) => {
    switch (status) {
        case 'connecting': return 'Connecting...';
        case 'connected': return 'Live';
        case 'ended': return 'Call Ended';
        default: return '';
    }
}

const CallView: React.FC<CallViewProps> = ({ contact, status, onEndCall, transcriptionHistory, currentTurn }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptionHistory, currentTurn]);
  
  const isSpeaking = status === 'connected' && currentTurn.modelOutput.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-zinc-800/90 backdrop-blur-sm text-white transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-6 border-b border-white/10">
        <div className="relative">
            <img
            src={contact.avatar}
            alt={contact.name}
            className={`w-24 h-24 rounded-full border-4 shadow-lg transition-all duration-300 ${isSpeaking ? 'border-green-400 scale-105' : 'border-white'}`}
            />
            {isSpeaking && (
                 <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>
            )}
        </div>
        <h2 className="text-3xl font-bold mt-4">{contact.name}</h2>
        <p className={`text-lg mt-1 capitalize px-3 py-1 rounded-full transition-colors ${status === 'connected' ? 'bg-green-500/20 text-green-300' : 'bg-white/10'}`}>
          {getStatusText(status)}
        </p>
      </div>

      {/* Transcription Area */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
        {transcriptionHistory.map((turn, index) => (
            <div key={index} className={`flex flex-col ${turn.author === MessageAuthor.ME ? 'items-end' : 'items-start'}`}>
                <p className={`text-xs font-bold mb-1 ${turn.author === MessageAuthor.ME ? 'text-blue-300' : 'text-green-300'}`}>
                    {turn.author === MessageAuthor.ME ? 'You' : contact.name}
                </p>
                <div className={`p-3 rounded-xl max-w-lg ${turn.author === MessageAuthor.ME ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                   {turn.text}
                </div>
            </div>
        ))}
        {/* Current Turn */}
        {currentTurn.userInput && (
             <div className="flex flex-col items-end opacity-70">
                 <p className="text-xs font-bold mb-1 text-blue-300">You</p>
                 <div className="p-3 rounded-xl max-w-lg bg-blue-500/30">
                    {currentTurn.userInput}
                 </div>
             </div>
        )}
         {currentTurn.modelOutput && (
             <div className="flex flex-col items-start opacity-70">
                 <p className="text-xs font-bold mb-1 text-green-300">{contact.name}</p>
                 <div className="p-3 rounded-xl max-w-lg bg-white/10">
                    {currentTurn.modelOutput}
                 </div>
             </div>
        )}
      </div>

      {/* Footer */}
      {(status === 'connecting' || status === 'connected') && (
        <div className="p-6 flex justify-center border-t border-white/10">
          <button
            onClick={onEndCall}
            className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors"
            aria-label="End call"
          >
            <EndCallIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallView;
