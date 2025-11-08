
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import CallView from './components/CallView';
import { type Chat, type Message, MessageAuthor, type User, type CallStatus, type Reaction, MessageStatus, MessageType, type TranscriptionTurn } from './types';
import { MOCK_CHATS, MOCK_USERS } from './services/mockData';
import { generateReply } from './services/geminiService';
import { TalkToMeIcon } from './components/icons';
import { GoogleGenAI, type LiveSession, type LiveServerMessage, Modality, type Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from './utils/audio';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'chats' | 'contacts'>('chats');
  const [callState, setCallState] = useState<{ status: CallStatus; contact: User | null }>({
    status: 'idle',
    contact: null,
  });

  // Live session state
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState({ userInput: '', modelOutput: '' });
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    // A welcome message for the first chat when app loads
    const firstChat = chats.find(c => c.id === 1);
    if (firstChat && firstChat.messages.length === 1) {
      handleWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWelcomeMessage = async () => {
    setIsTyping(true);
    try {
      const chat = chats.find(c => c.id === 1);
      if (!chat) return;

      const replyText = "Hey there! I'm using Talk To Me now. What's up?";
      
      const newReply: Message = {
        id: Date.now(),
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: MessageAuthor.THEM,
        type: MessageType.TEXT,
      };
      
      setChats(prevChats =>
        prevChats.map(c =>
          c.id === 1 ? { ...c, messages: [...c.messages, newReply] } : c
        )
      );
    } catch (error) {
      console.error("Error generating welcome message:", error);
    } finally {
      setIsTyping(false);
    }
  };


  const sendMessageAndHandleReply = async (message: Message) => {
    setIsTyping(true);

    try {
      const currentChat = chats.find(c => c.id === selectedChatId);
      if(!currentChat) return;

      const promptText = message.type === MessageType.AUDIO ? 
        `(The user sent a voice message. Acknowledge it or ask what it was about.)` : 
        message.text!;

      const replyText = await generateReply(promptText, currentChat.contact.name, currentChat.messages);
      
      const newReply: Message = {
        id: Date.now() + 1,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: MessageAuthor.THEM,
        type: MessageType.TEXT,
      };
      
      setChats(prevChats =>
        prevChats.map(c => {
          if (c.id === selectedChatId) {
            const updatedMessages = c.messages.map(msg => 
              msg.author === MessageAuthor.ME ? { ...msg, status: MessageStatus.READ } : msg
            );
            return { ...c, messages: [...updatedMessages, newReply] };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Failed to get reply from Gemini:", error);
      // Mark the sent message as failed
      setChats(prevChats =>
        prevChats.map(c =>
          c.id === selectedChatId
            ? { ...c, messages: c.messages.map(m => m.id === message.id ? {...m, status: MessageStatus.FAILED} : m) }
            : c
        )
      );
    } finally {
      setIsTyping(false);
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: MessageAuthor.ME,
      status: MessageStatus.SENT,
      type: MessageType.TEXT,
    };

    setChats(prevChats =>
      prevChats.map(c =>
        c.id === selectedChatId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );

    await sendMessageAndHandleReply(newMessage);
  };

  const handleSendVoiceMessage = async (audioSrc: string, duration: number) => {
    if (!selectedChatId) return;

    const newVoiceMessage: Message = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: MessageAuthor.ME,
      status: MessageStatus.SENT,
      type: MessageType.AUDIO,
      audioSrc,
      duration
    };

    setChats(prevChats =>
      prevChats.map(c =>
        c.id === selectedChatId
          ? { ...c, messages: [...c.messages, newVoiceMessage] }
          : c
      )
    );

    await sendMessageAndHandleReply(newVoiceMessage);
  };
  
  const handleRetrySendMessage = (messageId: number) => {
    if (!selectedChatId) return;
    const chat = chats.find(c => c.id === selectedChatId);
    const messageToRetry = chat?.messages.find(m => m.id === messageId);

    if (messageToRetry) {
      // Optimistically update status to SENT
      setChats(prevChats =>
        prevChats.map(c =>
          c.id === selectedChatId
            ? { ...c, messages: c.messages.map(m => m.id === messageId ? {...m, status: MessageStatus.SENT} : m) }
            : c
        )
      );
      sendMessageAndHandleReply(messageToRetry);
    }
  };

  const handleStartNewChat = (contact: User) => {
    const existingChat = chats.find(c => c.contact.id === contact.id);
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      const newChatId = chats.length > 0 ? Math.max(...chats.map(c => c.id)) + 1 : 1;
      const newChat: Chat = {
        id: newChatId,
        contact: contact,
        messages: [],
      };
      setChats(prevChats => [newChat, ...prevChats]);
      setSelectedChatId(newChatId);
    }
    setSidebarView('chats');
  };

  const handleStartCall = async () => {
    if (!selectedChat) return;
    setCallState({ status: 'connecting', contact: selectedChat.contact });
    setTranscriptionHistory([]);
    setCurrentTurn({ userInput: '', modelOutput: '' });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    sessionPromiseRef.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: async () => {
          setCallState(prev => ({ ...prev, status: 'connected' }));
          // FIX: Resolve TypeScript error for webkitAudioContext by casting window to any for cross-browser compatibility.
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
          outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

          microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = inputAudioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
          scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
          
          scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: Blob = {
              data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setCurrentTurn(prev => ({...prev, modelOutput: prev.modelOutput + text}));
          } else if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
             setCurrentTurn(prev => ({...prev, userInput: prev.userInput + text}));
          }

          if (message.serverContent?.turnComplete) {
            const fullInput = currentTurn.userInput;
            const fullOutput = currentTurn.modelOutput;
            
            setTranscriptionHistory(prev => [
                ...prev,
                { author: MessageAuthor.ME, text: fullInput },
                { author: MessageAuthor.THEM, text: fullOutput },
            ]);
            setCurrentTurn({ userInput: '', modelOutput: '' });
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
          if (base64Audio && outputAudioContextRef.current) {
            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.addEventListener('ended', () => {
              sources.delete(source);
            });
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(source);
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error('Live session error:', e);
          handleEndCall();
        },
        onclose: () => {
          console.log('Live session closed.');
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
  };


  const handleEndCall = () => {
    setCallState(prev => ({ ...prev, status: 'ended' }));
    
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    microphoneStreamRef.current?.getTracks().forEach(track => track.stop());
    microphoneStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;

    setTimeout(() => {
      setCallState({ status: 'idle', contact: null });
    }, 1500);
  };

  const handleReaction = (messageId: number, emoji: string) => {
    if (!selectedChatId) return;

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === selectedChatId) {
          const updatedMessages = chat.messages.map(message => {
            if (message.id === messageId) {
              let newReactions: Reaction[] = message.reactions ? JSON.parse(JSON.stringify(message.reactions)) : [];
              const myPreviousReactionIndex = newReactions.findIndex(r => r.byMe);
              const targetReactionIndex = newReactions.findIndex(r => r.emoji === emoji);

              if (myPreviousReactionIndex > -1) {
                const myPrevReaction = newReactions[myPreviousReactionIndex];
                myPrevReaction.count--;
                myPrevReaction.byMe = false;
              }

              if (myPreviousReactionIndex === -1 || newReactions[myPreviousReactionIndex].emoji !== emoji) {
                if (targetReactionIndex > -1) {
                  newReactions[targetReactionIndex].count++;
                  newReactions[targetReactionIndex].byMe = true;
                } else {
                  newReactions.push({ emoji, count: 1, byMe: true });
                }
              }
              
              newReactions = newReactions.filter(r => r.count > 0);
              return { ...message, reactions: newReactions };
            }
            return message;
          });
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      })
    );
  };

  return (
    <div className="h-screen w-screen p-0 sm:p-4 bg-[#00a884] dark:bg-zinc-800 flex items-center justify-center">
        <div className="h-full w-full sm:h-[95%] sm:w-[98%] max-w-6xl bg-[#f0f2f5] dark:bg-zinc-900 shadow-2xl rounded-none sm:rounded-lg flex overflow-hidden">
        <Sidebar
          chats={chats}
          contacts={MOCK_USERS}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          view={sidebarView}
          onSetView={setSidebarView}
          onStartNewChat={handleStartNewChat}
          onStartCall={handleStartCall}
        />
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat} 
            onSendMessage={handleSendMessage} 
            onSendVoiceMessage={handleSendVoiceMessage}
            isTyping={isTyping} 
            onReact={handleReaction}
            onRetry={handleRetrySendMessage}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-zinc-800 text-center p-8">
            <TalkToMeIcon />
            <h1 className="text-4xl font-light text-gray-500 dark:text-gray-300 mt-4">Talk To Me</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Send and receive messages with AI-powered contacts.
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Select a chat to start messaging.
            </p>
          </div>
        )}
        
        {callState.status !== 'idle' && callState.contact && (
            <CallView
                contact={callState.contact}
                status={callState.status}
                onEndCall={handleEndCall}
                transcriptionHistory={transcriptionHistory}
                currentTurn={currentTurn}
            />
        )}
      </div>
    </div>
  );
};

export default App;