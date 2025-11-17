import { useMemo, useState } from "react"
import { useAppSelector } from "../../app/hooks";
import { selectPlayers } from "../../features/players/playerSlice";
import { Player } from "../../features/players/types";

interface SearchComponentProps {
  onSelect: (player: Player) => void
}

export const SearchComponent: React.FC<SearchComponentProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false);
  const players = useAppSelector(selectPlayers)

  const filteredPlayers = useMemo(() => {
    if (!query) return [];
    return players
      .filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, players]);

  const handleSelect = (player: Player) => {
    setQuery('');
    onSelect(player);
    setIsFocused(false);
  };

  return (
    <div className="relative w-80 md:w-64">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={ev => setQuery(ev.target.value)}
          //onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for a player..."
          className="w-full py-2 pl-10 pr-4 bg-white/50 text-gray-900 rounded-full border-2 border-transparent outline-none transition-all duration-300 ease-in-out backdrop-blur-sm shadow-lg focus:border-indigo-500 focus:bg-white placeholder-gray-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      {isFocused && query && filteredPlayers.length > 0 && (
        <ul className="absolute mt-2 w-full bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-20 ring-1 ring-black/5 list-none p-0">
          {filteredPlayers.map(player => (
            <li
              key={player.id}
              onClick={() => handleSelect(player)}
              className="flex items-center p-3 cursor-pointer transition-colors duration-200 hover:bg-indigo-100"
            >
              <img src={player.image} alt={player.label} className="w-8 h-8 rounded-full mr-3 object-cover" />
              <span className="text-gray-800">{player.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
