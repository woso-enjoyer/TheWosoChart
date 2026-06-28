import { useCallback, useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectPlayers } from "../../features/players/playerSlice";
import { selectRelationships } from "../../features/relationship/relationshipSlice";

export type FilterType = 'club' | 'country' | 'relationship' | null;
export type FilterValue = string | null;

interface FilterControlsProps {
  onFilterChange: (type: FilterType, value: FilterValue) => void;
}

export const FilterControlsComponent: React.FC<FilterControlsProps> = ({ onFilterChange }) => {
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [selectValue, setSelectValue] = useState('all');
  const players = useAppSelector(selectPlayers)
  const relationships = useAppSelector(selectRelationships)

  const clubs = useMemo(() => {
    // todo: change this when data is fixed
    const clubSet = new Set(players.map(p => p.club));
    clubSet.delete(undefined)
    return Array.from(clubSet).sort();
  }, [players]);

  const countries = useMemo(() => {
    const countrySet = new Set(players.map(p => p.group));
    countrySet.delete('Nonplayer')
    return Array.from(countrySet).sort();
  }, [players]);

  const relationshipTypes = useMemo(() => {
    const relationshipSet = new Set(relationships.map(p => p.label))
    return Array.from(relationshipSet).sort();
  }, [relationships])

  const handleTypeChange = useCallback((type: 'club' | 'country' | 'relationship') => {
    if (filterType === type) {
      setFilterType(null);
      onFilterChange(null, null);
    } else {
      setFilterType(type);
      setSelectValue('all'); 
      onFilterChange(type, null);
    }
  }, [filterType, onFilterChange]);

  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectValue(value);
    if (value === 'all') {
      onFilterChange(filterType, null);
    } else {
      onFilterChange(filterType, value);
    }
  }, [filterType, onFilterChange]);
  
  const options = filterType === 'club' ? clubs : filterType === 'country' ? countries : relationshipTypes;

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleTypeChange('club')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 backdrop-blur-sm shadow-md ${
            filterType === 'club'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/50 text-gray-700 hover:bg-white/80'
          }`}
        >
          Club
        </button>
        <button
          onClick={() => handleTypeChange('country')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 backdrop-blur-sm shadow-md ${
            filterType === 'country'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/50 text-gray-700 hover:bg-white/80'
          }`}
        >
          Country
        </button>
        <button
          onClick={() => handleTypeChange('relationship')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 backdrop-blur-sm shadow-md ${
            filterType === 'relationship'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/50 text-gray-700 hover:bg-white/80'
          }`}
        >
          Relationship
        </button>
      </div>

      {filterType && (
        <div className="relative">
          <select
            value={selectValue}
            onChange={handleValueChange}
            className="w-full sm:w-auto appearance-none py-2 pl-4 pr-10 bg-white/50 text-gray-900 rounded-full border-2 border-transparent outline-none transition-all duration-300 ease-in-out backdrop-blur-sm shadow-lg focus:border-indigo-500 focus:bg-white"
          >
            <option value="all">All Players</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
             <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      )}
    </div>
  );
};