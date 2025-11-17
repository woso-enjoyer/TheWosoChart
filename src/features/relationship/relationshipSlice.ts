import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { Relationship } from "./types"
import { fetchRelationships } from "./relationshipAPI"

export interface RelationshipSliceState {
    status: "idle" | "loading" | "failed"
    relationships: Relationship[]
}

const initialState: RelationshipSliceState = {
    status: "loading",
    relationships: [],
}

export const relationshipsSlice = createAppSlice({
    name: "relationship",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: create => ({
      // Use the `PayloadAction` type to declare the contents of `action.payload`
      updateRelationship: create.reducer((state, action: PayloadAction<Relationship>) => {
        const index = state.relationships.findIndex(
          element => element.from === action.payload.from &&
          element.to === action.payload.to
        )
        if(index === -1) return;
        state.relationships[index] = action.payload
      }),
      // The function below is called a thunk and allows us to perform async logic. It
      // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
      // will call the thunk with the `dispatch` function as the first argument. Async
      // code can then be executed and other actions can be dispatched. Thunks are
      // typically used to make async requests.
      fetchRelationshipsAsync: create.asyncThunk(
        async () => {
          const response = await fetchRelationships()
          // The value we return becomes the `fulfilled` action payload
          return response
        },
        {
          pending: state => {
            state.status = "loading"
          },
          fulfilled: (state, action) => {
            state.status = "idle"
            state.relationships = action.payload
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
      selectRelationshipsStatus: state => state.status,
      selectRelationships: state => state.relationships,
    },
  })

  export const { updateRelationship, fetchRelationshipsAsync } =
  relationshipsSlice.actions

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectRelationships, selectRelationshipsStatus } = relationshipsSlice.selectors
