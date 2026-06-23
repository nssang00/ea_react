import { useState } from 'react';
import { Empty } from 'antd';
import { ReactFlow, Background, Controls, Handle, MiniMap, Position } from '@xyflow/react';

function ModelNode({ data, selected }) {
  return (
    <div className={`model-node ${selected ? 'selected-node' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} />
      <strong>{data.label}</strong>
      <div className="model-node-type">{data.type}</div>
      <Handle className="flow-handle" type="source" position={Position.Right} />
    </div>
  );
}

function QosNode({ data, selected }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`qos-node qos-node--${data.variant} ${collapsed ? 'qos-node--collapsed' : ''} ${selected ? 'selected-node' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} />
      <div className="qos-node-type">{data.type}</div>
      <div className="qos-node-header">
        <strong>{data.label}</strong>
        {data.fields?.length > 0 && (
          <button
            className="qos-node-collapse nodrag"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setCollapsed((value) => !value);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '+' : '-'}
          </button>
        )}
      </div>
      {!collapsed && data.fields?.length > 0 && (
        <div className="qos-node-fields">
          {data.fields.map((row) => (
            <QosFieldRow key={row.key} row={row} onUpdate={data.onUpdateQosProperty} />
          ))}
        </div>
      )}
      <Handle className="flow-handle" type="source" position={Position.Right} />
    </div>
  );
}

function DiagramGroup({ data }) {
  return (
    <div className="diagram-group">
      <div className="diagram-group-title">{data.label}</div>
    </div>
  );
}

function QosFieldRow({ onUpdate, row }) {
  const handleUpdate = (value) => {
    if (!row.editable || !onUpdate) return;
    onUpdate(row.profileId, row.entityKey, row.key, value);
  };

  return (
    <div className={`qos-node-field ${row.editable ? 'qos-node-field--editable' : ''}`}>
      <span title={row.key}>{shortFieldLabel(row.key)}</span>
      {row.editable ? (
        <QosFieldControl row={row} onUpdate={handleUpdate} />
      ) : (
        <b>{String(row.value)}</b>
      )}
    </div>
  );
}

function QosFieldControl({ onUpdate, row }) {
  if (typeof row.value === 'boolean') {
    return (
      <button
        className="qos-node-field-button nodrag"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onUpdate(!row.value);
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {String(row.value)}
      </button>
    );
  }

  return (
    <input
      className="qos-node-field-input nodrag"
      type={typeof row.value === 'number' ? 'number' : 'text'}
      value={String(row.value)}
      onChange={(event) => {
        const nextValue = typeof row.value === 'number' ? Number(event.target.value) : event.target.value;
        onUpdate(nextValue);
      }}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    />
  );
}

function shortFieldLabel(key) {
  return key.split('.').slice(-2).join('.');
}

const nodeTypes = {
  diagramGroup: DiagramGroup,
  modelNode: ModelNode,
  qosNode: QosNode,
};

export default function ModelDiagram({
  edges,
  hasModel,
  nodes,
  onNodesChange,
  onEdgesChange,
  onSelectElement,
  onUpdateQosProperty,
}) {
  const diagramNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onUpdateQosProperty,
    },
  }));

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
        nodes={diagramNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onSelectElement(node.data?.selectId ?? node.id)}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => miniMapNodeColor(node)}
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

function miniMapNodeColor(node) {
  if (node.type !== 'qosNode') return '#ffffff';

  const colors = {
    profile: '#e6f4ff',
    profileCompact: '#ffffff',
    policy: '#f6ffed',
    value: '#fff7e6',
    topic: '#f9f0ff',
    participant: '#8bbbd0',
    publisher: '#d0af78',
    subscriber: '#b5a5d0',
    datawriter: '#9bb7da',
    datareader: '#9cc7ce',
    library: '#cbd5e1',
    module: '#cbd5e1',
    struct: '#9bb7da',
    union: '#b5a5d0',
    enum: '#d0af78',
    domain: '#9bc6bb',
    registerType: '#b5a5d0',
  };

  return colors[node.data?.variant] ?? '#ffffff';
}
