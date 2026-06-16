import { Empty } from 'antd';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { useDiagramModel } from '../hooks/useDiagramModel.js';

function ModelNode({ data, selected }) {
  return (
    <div className={`model-node ${selected ? 'selected-node' : ''}`}>
      <strong>{data.label}</strong>
      <div className="model-node-type">{data.type}</div>
    </div>
  );
}

const nodeTypes = {
  modelNode: ModelNode,
};

export default function ModelDiagram() {
  const { nodes, edges, hasModel, selectElement } = useDiagramModel();

  if (!hasModel) {
    return (
      <div className="diagram-wrapper">
        <Empty description="Loading model..." />
      </div>
    );
  }

  return (
    <div className="diagram-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => selectElement(node.id)}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor="#ffffff"
          nodeStrokeColor={(node) => node.selected ? '#1677ff' : '#98a2b3'}
          nodeBorderRadius={6}
          maskColor="rgba(248, 250, 252, 0.72)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
