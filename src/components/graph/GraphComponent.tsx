import { Network, FocusOptions, Options, IdType } from "vis-network"
import { DataSet } from "vis-data"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectPlayers, setSelectedPlayer } from "../../features/players/playerSlice"
import { selectRelationships } from "../../features/relationship/relationshipSlice"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import styles from "./Graph.module.css"
import { Player } from "../../features/players/types"
import { FilterType, FilterValue } from "../controls/FilterControlsComponent"

const defaultOptions: Options = {
  nodes: {
    shape: "circularImage",
    borderWidth: 6,
    size: 30,
  },
  edges: {
    smooth: { enabled: false, type: "continuous", roundness: 0.5 },
    width: 2,
  },
  groups: {
    Nonplayer: {
      color: { background: "gray", border: "gray" },
      borderWidth: 6,
      size: 30,
      shape: "dot"
    },
  },
  physics: {
    forceAtlas2Based: {
      gravitationalConstant: -26,
      springLength: 100,
      springConstant: 0.18,
      centralGravity: 0.001, //springLength: 180, springConstant: 0.02, 
      damping: 0.09,
      avoidOverlap: 0.8 // is .9 better?
    },
    barnesHut: {
      theta: 0.7,
      gravitationalConstant: -4000,
      centralGravity: 0.9,
      springLength: 50,
      springConstant: 0.08,
      damping: 0.5,
      avoidOverlap: 0.3,
    },
    repulsion: {
      centralGravity: 0.2,
      springLength: 180,
      springConstant: 0.2,
      nodeDistance: 160,
      damping: 0.09,
    },

    maxVelocity: 200,
    solver: "forceAtlas2Based",
    timestep: 0.35,
    stabilization: { iterations: 100, enabled: true },
  },
  layout: {
    improvedLayout: false
  },
  interaction: { hover: true, dragNodes: true, navigationButtons: false, keyboard: false }
}

export interface GraphComponentHandle {
  focusPlayer: (player: Player) => void;
  setFilter: (type: FilterType, value: FilterValue) => void;
}

export const GraphComponent = forwardRef<GraphComponentHandle, {}>(({}, ref) => {

  const players = useAppSelector(selectPlayers)
  const relationships = useAppSelector(selectRelationships)
  const dispatch = useAppDispatch()
  const nodes = useRef(new DataSet(players))
  const edges = useRef(new DataSet(relationships))
  const network = useRef<Network | null>(null)
  const container = useRef<HTMLDivElement>(null)
  
  console.log("loaded graph")

  useEffect(() => {
    network.current = new Network(
      container.current!,
      { nodes: nodes.current, edges: edges.current },
      defaultOptions,
    )
  }, [])

  useImperativeHandle(ref, () => ({
    focusPlayer: (player: Player) => {
      const current = network.current

      if (!current) return

      const options: FocusOptions = {
          scale: 1.0,
          offset: { x: 0, y: 0 },
          animation: {
              duration: 1000,
              easingFunction: "easeInOutQuad",
          },
      };
      
      current.focus(player.id, options);
      current.selectNodes([player.id]);
    },

    setFilter: (type: FilterType, value: FilterValue) => {
      const current = network.current

      if (!current) return

      // reset the graph by setting all nodes and edges to hidden = false 
      nodes.current.updateOnly(Array.from(nodes.current.get()).map(n => { return {id: n.id, hidden: false } }))
      edges.current.updateOnly(Array.from(edges.current.get()).map(e => { return { id: e.id, hidden: false } }))

      if(value && type) {
        const allNodes = nodes.current.get();
        const allEdges = edges.current.get();
        const nodesToHide = new Set(allNodes.map(node => node.id));
        const edgesToHide = new Set<number>();

        if(type === "relationship") {
          allEdges.forEach(n => edgesToHide.add(n.id))
          for(let edge of allEdges) {
            if(edge.label === value) {
              edgesToHide.delete(edge.id)
              nodesToHide.delete(edge.from);
              nodesToHide.delete(edge.to);
            }
          }
        }
        else {
          for(let node of allNodes) {
            // don't hide this node
            if(( type === 'country' && node.group === value) || (type === 'club' && node.club === value) ) {
              nodesToHide.delete(node.id)
              const connectedNodes = current.getConnectedNodes(node.id) as IdType[]
              // also show the connected nodes
              for(let connectedNode of connectedNodes) {
                nodesToHide.delete(connectedNode as number)
              }
            }
          }
        }

        nodes.current.updateOnly(Array.from(nodesToHide).map(nodeId => { 
          return {id: nodeId, hidden: true }
        }))

        edges.current.updateOnly(Array.from(edgesToHide).map(edgeId => {
          return {id: edgeId, hidden: true }
        }))
      }
    },
  }), []);

  useEffect(() => {
    const current = network.current

    if (!current) return

    const onNodeSelect = (params: any) => {
      const playerId: number = params.nodes[0]
      if (!playerId) return

      const player = nodes.current.get(playerId)

      if (!player) return

      dispatch(setSelectedPlayer(player))

      console.log("selectNode Event:", params)
    }

    const onNodeDeselect = (params: any) => {
      const playerId: number | undefined = params.nodes[0]
      if (playerId === undefined) {
        dispatch(setSelectedPlayer(undefined))
        console.log("deselectNode Event:", params)
      }
    }

    const onStabilized = () => {
      current.setOptions({ physics: false });
    }

    current.on("selectNode", onNodeSelect)
    current.on("deselectNode", onNodeDeselect)
    current.on('stabilized', onStabilized);    

    return () => {
      if (current) {
        current.off("selectNode", onNodeSelect)
        current.off("deselectNode", onNodeDeselect)
        current.off('stabilized', onStabilized)
      }
    }
  }, [])

  return <div ref={container} className={styles.mynetwork} />
})
