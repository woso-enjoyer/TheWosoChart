import { Relationship } from "./types"

export const fetchRelationships = async (): Promise<Relationship[]> => {
  const response = await fetch("/data/relationships.json")

  const json = await response.json()

  const relationships = json.relationships as Relationship[];

  return sanitizeRelationshipData(relationships)
}

const labelColorMap = { "Gf": "6aa84f", "Rumor": "ab57ff", "Ex": "ff0000", "Wife": "9cc2e5"}

export const sanitizeRelationshipData = (data: Relationship[]): Relationship[] => {
    data.forEach((element, index) => {
      element.id = index;
      // @ts-ignore
      element.color = labelColorMap[element.label]
    })
    return data
}