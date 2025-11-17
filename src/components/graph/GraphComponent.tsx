import { Network, FocusOptions, Options, IdType } from "vis-network"
import { DataSet } from "vis-data"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectPlayers, setSelectedPlayer } from "../../features/players/playerSlice"
import { selectRelationships } from "../../features/relationship/relationshipSlice"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import styles from "./Graph.module.css"
import { Player } from "../../features/players/types"

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
      springLength: 230,
      springConstant: 0.18,
      centralGravity: 0.001, //springLength: 180, springConstant: 0.02, 
      damping: 0.09, avoidOverlap: 0.8
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
  interaction: { hover: true, dragNodes: true, navigationButtons: false, keyboard: true }
}

export interface GraphComponentHandle {
  focusPlayer: (player: Player) => void;
  setFilter: (type: 'club' | 'country' | null, value: string | null) => void;
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

      var options: FocusOptions = {
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

    setFilter: (type: 'club' | 'country' | null, value: string | null) => {
      const current = network.current

      if (!current) return

      // reset the graph
      const updateObj = Array.from(nodes.current.get()).map(n => { return {id: n.id, hidden: false } })
      nodes.current.updateOnly(updateObj)

      if(value && type) {
        const allNodes = nodes.current.get();
        const nodesToHide = new Set(allNodes.map(n => n.id));
        for(let node of allNodes) {
          // don't hide this node
          if(( type === 'country' && node.group === value) || (type === 'club' && node.club === value) ) {
            console.log(value)
            nodesToHide.delete(node.id)
            const connectedNodes = current.getConnectedNodes(node.id) as IdType[]
            // also show the connected nodes
            for(let connectedNode of connectedNodes) {
              nodesToHide.delete(connectedNode as number)
            }
          }
        }

        const updateObj = Array.from(nodesToHide).map(nd => { 
          return {id: nd, hidden: true }
        })

        nodes.current.updateOnly(updateObj)
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
