import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { fetchPlayers } from "./playerAPI"
import { Player } from "./types"

export interface PlayerSliceState {
  status: "idle" | "loading" | "failed"
  players: Player[]
  selectedPlayer: Player | undefined
}

const initialState: PlayerSliceState = {
  status: "loading",
  players: [],
  selectedPlayer: undefined,
}

export const playerSlice = createAppSlice({
  name: "player",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: create => ({
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    updatePlayer: create.reducer((state, action: PayloadAction<Player>) => {
      const index = state.players.findIndex(
        element => element.id === action.payload.id,
      )
      if(index === -1) return;
      state.players[index] = action.payload
    }),
    setSelectedPlayer: create.reducer((state, action: PayloadAction<Player | undefined>) => {
        state.selectedPlayer = action.payload
    }),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    fetchPlayersAsync: create.asyncThunk(
      async () => {
        const response = await fetchPlayers()
        // The value we return becomes the `fulfilled` action payload
        return response
      },
      {
        pending: state => {
          state.status = "loading"
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.players = action.payload
        },
        rejected: state => {
          state.status = "failed"
        },
      },
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectPlayerStatus: state => state.status,
    selectPlayers: state => state.players,
    selectSelectedPlayer: state => state.selectedPlayer,
  },
})

// Action creators are generated for each case reducer function.
export const { updatePlayer, fetchPlayersAsync, setSelectedPlayer } =
  playerSlice.actions

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectPlayers, selectPlayerStatus, selectSelectedPlayer } = playerSlice.selectors
