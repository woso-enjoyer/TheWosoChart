import { useCallback, useState } from "react";
import { Player } from "../../features/players/types";
import { FilterControlsComponent } from "./FilterControlsComponent";
import { SearchComponent } from "./SearchComponent";

interface ControlsProps {
    onFilterChange: (type: 'club' | 'country' | null, value: string | null) => void;
    onSelectPlayer: (player: Player) => void
}

export const ControlsComponent: React.FC<ControlsProps> = ({ onFilterChange, onSelectPlayer }) => {
    const [ filterType, setFilterType ] = useState<'club' | 'country' | null>(null)
    const [ filterValue, setFilterValue ] = useState<string | null>(null)

    const handleFilterChange = useCallback((type: 'club' | 'country' | null, value: string | null) => {
        setFilterValue(value)
        setFilterType(type)
        onFilterChange(type, value)
    }, [])

    return (
        <div className="absolute top-0 left-0 p-6 z-10">
            <SearchComponent onSelect={onSelectPlayer} filterType={filterType} filterValue={filterValue}/>
            <FilterControlsComponent onFilterChange={handleFilterChange} />
        </div>
    )
}