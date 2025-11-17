import { Player } from "./types"

export const fetchPlayers = async (): Promise<Player[]> => {
  const response = await fetch("./data/players.json")

  const json = await response.json()

  const players = json.players as Player[]

  return sanitizePlayersData(players)
}

export const sanitizePlayersData = (data: Player[]): Player[] => {
  data.forEach(element => {
    element.image = `img/${element.image}`

    element.shape = "circularImage"
  })

  return data
}
