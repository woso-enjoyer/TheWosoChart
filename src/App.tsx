import { useCallback, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import {
  fetchPlayersAsync,
  selectPlayerStatus,
  setSelectedPlayer,
} from "./features/players/playerSlice"
import { GraphComponent, GraphComponentHandle } from "./components/graph/GraphComponent"
import {
  fetchRelationshipsAsync,
  selectRelationshipsStatus,
} from "./features/relationship/relationshipSlice"
import { Player } from "./features/players/types"
import { PlayerComponent } from "./components/player/PlayerComponent"
import { ControlsComponent } from "./components/controls/ControlsComponent"
import { FilterType, FilterValue } from "./components/controls/FilterControlsComponent"

const App = () => {
  const dispatch = useAppDispatch()
  const playerLoadStatus = useAppSelector(selectPlayerStatus)
  const relationshipsLoadStatus = useAppSelector(selectRelationshipsStatus)
  const graph = useRef<GraphComponentHandle>(null);

  useEffect(() => {
    // load the data on page load
    dispatch(fetchPlayersAsync())
    dispatch(fetchRelationshipsAsync())
  }, [])

  const handleSelectPlayer = useCallback((player: Player) => {
    if (graph.current) {
      dispatch(setSelectedPlayer(player));
      graph.current.focusPlayer(player);
    }
  }, []);

  const handleFilter = useCallback((type: FilterType, value: FilterValue) => {
    dispatch(setSelectedPlayer(undefined)); // Deselect player when a filter is applied
    if(graph.current) {
      graph.current.setFilter(type, value);
    }
  }, [])

  console.log('re render')

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-100 text-gray-800">
      <PlayerComponent />
      <ControlsComponent onSelectPlayer={handleSelectPlayer} onFilterChange={handleFilter} />
      {playerLoadStatus === "idle" && relationshipsLoadStatus === "idle" && (
        <GraphComponent ref={graph}/>
      )}
    </main>
  )
}

export default App
