import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';

export function useDiagramModel() {
  const { model, selectedElementId, selectElement } = useWorkbenchModel();

  const nodes = useMemo(() => {
    if (!model) return [];

    return model.diagram.nodes.map((node) => {
      const element = model.elementsById[node.id];

      return {
        id: node.id,
        type: 'modelNode',
        position: node.position,
        width: 170,
        height: 68,
        selected: node.id === selectedElementId,
        data: {
          label: element?.name ?? node.id,
          type: element?.type ?? 'Unknown',
        },
      };
    });
  }, [model, selectedElementId]);

  const edges = useMemo(() => {
    if (!model) return [];

    return model.diagram.edges.map((edge) => ({
      ...edge,
      animated: edge.source === selectedElementId || edge.target === selectedElementId,
    }));
  }, [model, selectedElementId]);

  return {
    nodes,
    edges,
    hasModel: Boolean(model),
    selectElement,
  };
}
