import { useCallback, useEffect, useMemo } from 'react';
import { applyEdgeChanges, applyNodeChanges, MarkerType, Position, useEdgesState, useNodesState } from '@xyflow/react';
import { useWorkbenchModel } from './useWorkbenchModel.js';
import { buildDiagram } from '../model/diagramBuilders.js';

export function useDiagramModel() {
  const { activeExplorerViewId, model, selectedElementId, selectElement, updateQosProperty } = useWorkbenchModel();
  const computedNodes = useMemo(() => {
    if (!model) return [];
    return buildDiagram(model, activeExplorerViewId, selectedElementId).nodes
      .map((node) => toFlowNode(node, model, selectedElementId));
  }, [activeExplorerViewId, model, selectedElementId]);
  const [nodes, setNodes] = useNodesState(computedNodes);
  const computedEdges = useMemo(() => {
    if (!model) return [];
    return buildDiagram(model, activeExplorerViewId, selectedElementId).edges.map((edge) => ({
      ...edge,
      type: edge.type ?? 'smoothstep',
      markerEnd: edge.markerEnd === undefined ? { type: MarkerType.ArrowClosed } : edge.markerEnd,
      animated: edge.source === selectedElementId || edge.target === selectedElementId,
    }));
  }, [activeExplorerViewId, model, selectedElementId]);
  const [edges, setEdges] = useEdgesState(computedEdges);

  useEffect(() => {
    setNodes((current) => {
      const positions = Object.fromEntries(current.map((node) => [node.id, node.position]));
      return computedNodes.map((node) => ({
        ...node,
        position: positions[node.id] ?? node.position,
      }));
    });
  }, [computedNodes, setNodes]);

  const onNodesChange = useCallback((changes) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, [setNodes]);
  useEffect(() => setEdges(computedEdges), [computedEdges, setEdges]);
  const onEdgesChange = useCallback((changes) => setEdges((current) => applyEdgeChanges(changes, current)), [setEdges]);

  return { nodes, edges, hasModel: Boolean(model), onNodesChange, onEdgesChange, selectElement, updateQosProperty };
}

function toFlowNode(node, model, selectedElementId) {
  const element = model.elementsById[node.id];
  return {
    id: node.id,
    type: node.nodeType ?? 'modelNode',
    position: node.position,
    width: node.width ?? 170,
    height: node.height ?? 68,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: node.draggable ?? true,
    selectable: node.selectable ?? true,
    zIndex: node.zIndex ?? 1,
    selected: node.id === selectedElementId,
    data: { label: element?.name ?? node.id, type: element?.type ?? 'Unknown', ...node.data },
  };
}
