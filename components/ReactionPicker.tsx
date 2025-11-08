import React from 'react';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect }) => {
    return (
        <div className="bg-white dark:bg-zinc-700 rounded-full shadow-lg p-1 flex items-center space-x-1 border border-gray-200 dark:border-zinc-600" role="toolbar">
            {REACTIONS.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-transform transform hover:scale-125"
                    aria-label={`React with ${emoji}`}
                >
                    <span className="text-xl" role="img" aria-label={emoji}>{emoji}</span>
                </button>
            ))}
        </div>
    );
};

export default ReactionPicker;