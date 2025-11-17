import { useCallback, useEffect } from "react";
import { Player } from "../../features/players/types";
import styles from "./PlayerStats.module.css"

interface PlayerStatsModalProps {
  player: Player;
  onClose: () => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ player, onClose }) => { 
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4"
            aria-labelledby="stats-modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col transition-all duration-300 ease-in-out transform scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 id="stats-modal-title" className="text-xl font-bold text-gray-900">{player.label} - Statistics</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200/70"
                        aria-label="Close statistics modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    { (player.group !== 'Nonplayer' && player.sofascore) && (
                          <iframe id={`sofa-player-embed-${player.sofascore}`} src={`https://widgets.sofascore.com/en/embed/player/${player.sofascore}?widgetTheme=light`} className={styles.sofascore}></iframe>
                        )}
                </div>

                <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Done
                    </button>
                </div>

            </div>
            <style>{`
                @keyframes fadeInScale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};