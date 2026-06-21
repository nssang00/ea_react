import ModelDiagram from '../components/ModelDiagram.jsx';
import { useDiagramModel } from '../hooks/useDiagramModel.js';

export default function DiagramView() {
  const { nodes, edges, hasModel, onNodesChange, selectElement, updateQosProperty } = useDiagramModel();

  return (
    <ModelDiagram
      edges={edges}
      hasModel={hasModel}
      nodes={nodes}
      onNodesChange={onNodesChange}
      onSelectElement={selectElement}
      onUpdateQosProperty={updateQosProperty}
    />
  );
}
