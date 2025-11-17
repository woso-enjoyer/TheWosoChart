import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectPlayers, selectSelectedPlayer, setSelectedPlayer } from "../../features/players/playerSlice"
import { Player } from "../../features/players/types"
import { selectRelationships } from "../../features/relationship/relationshipSlice"
import { PlayerStatsModal } from "../player-stats/PlayerStatsModal"
import { useMemo, useState } from "react"

export const PlayerComponent = () => {
  const player = useAppSelector(selectSelectedPlayer)
  const relationships = useAppSelector(selectRelationships)
  const players = useAppSelector(selectPlayers)
  const [isExpanded, setExpanded] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(setSelectedPlayer(undefined))
  }

  const onSelectPlayer = (other: Player) => {
    dispatch(setSelectedPlayer(other))
  }

  const connections = useMemo(() => {
    if (!player) return [];

    const connectedRelationships = relationships.filter(
      r => r.from === player.id || r.to === player.id
    );

    return connectedRelationships
      .map(rel => {
        const otherPlayerId = rel.from === player.id ? rel.to : rel.from;
        const otherPlayer = players.find(p => p.id === otherPlayerId);
        return {
          otherPlayer,
          relationshipType: rel.label,
        };
      })
      .filter((conn): conn is { otherPlayer: Player; relationshipType: string } => !!conn.otherPlayer);
  }, [player, players, relationships]);

  if (!player) return null

  return (
    <>
    <div 
        className={`absolute top-0 right-0 w-full max-w-sm p-6 sm:p-4 z-20 transition-transform duration-500 ease-in-out transform ${
            player ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      <div className="bg-white/70 backdrop-blur-xl max-h-full rounded-2xl shadow-2xl p-6 flex flex-col text-gray-700 ring-1 ring-black/10">
        <div className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{player.label}</h2>
            <button
                onClick={onClose}
                className="text-gray-500 transition-colors p-1 rounded-full bg-gray-200/50 hover:text-gray-900 hover:bg-gray-300/70"
                aria-label="Close player info"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          <div className="mt-4 flex items-center">
              <img src={player.image} alt={player.label} className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover" />
              <div className="ml-4 space-y-1">
                { player.group !== 'Nonplayer' && (
                  <>
                  <p><strong>Country:</strong> {player.group}</p>
                  <p><strong>Club:</strong> {player.club ?? 'Unknown'}</p>
                  <p><strong>Age:</strong> {player.dateOfBirthTimestamp ? new Date().getUTCFullYear() - new Date(player.dateOfBirthTimestamp * 1000).getUTCFullYear() : 'Unknown'}</p>
                  </>
                )}
                { player.group === 'Nonplayer' && (
                  <p>Not a football player</p>
                )}
                  
              </div>
          </div>
        </div>
        <div className="mt-6 flex-grow overflow-y-auto pr-2">
                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-indigo-500 flex justify-between items-center"
                    aria-expanded={isExpanded}
                >
                    <span>{isExpanded ? 'Less info' : 'More info'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isExpanded && (
                <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}>
                  {connections.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200/80 flex-shrink-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Connections</h3>
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {connections.map(({ otherPlayer, relationshipType }) => (
                                  <button
                                      key={`${otherPlayer.id}-${relationshipType}`}
                                      onClick={() => onSelectPlayer(otherPlayer)}
                                      className="w-full flex items-center p-2 rounded-lg text-left transition-colors duration-200 hover:bg-gray-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  >
                                      <img src={otherPlayer.image} alt={otherPlayer.label} className="w-10 h-10 rounded-full mr-3 object-cover flex-shrink-0" />
                                      <div className="flex-grow">
                                          <p className="font-semibold text-gray-900">{otherPlayer.label}</p>
                                          <p className="text-sm text-gray-500">{relationshipType}</p>
                                      </div>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
                    { player.sofascore && (
                      <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-center overflow-hidden">
                        <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="w-full bg-white text-indigo-600 border-2 border-indigo-600 font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-indigo-50 flex justify-center items-center"
                      >
                        View Statistics
                        </button>
                    </div>
                  )}
                </div>
                )}
            </div>
      </div>
    </div>
    {isStatsModalOpen && player && (
      <PlayerStatsModal player={player} onClose={() => setIsStatsModalOpen(false)} />
    )}
    </>
  )
}