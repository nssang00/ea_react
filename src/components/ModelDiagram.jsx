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

function TypeNode({ data, selected }) {
  return (
    <div className={`uml-type-node uml-type-node--${data.variant} ${selected ? 'selected-node' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} />
      <div className="uml-type-node-header">
        <div className="uml-type-node-stereotype">«{data.stereotype ?? data.label?.toLowerCase()}»</div>
        <strong>{data.type}</strong>
      </div>
      <div className="uml-type-node-members">
        {data.fields?.length > 0 ? data.fields.map((field) => (
          <div className="uml-type-node-member" key={field.key}>
            <span>+ {field.key}</span>
            <b>{String(field.value ?? '')}</b>
          </div>
        )) : <span className="uml-type-node-empty">No members</span>}
      </div>
      <Handle className="flow-handle" type="source" position={Position.Right} />
    </div>
  );
}

function DomainNode({ data, selected }) {
  return (
    <div className={`dds-card dds-card--domain ${selected ? 'selected-node' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} />
      <CardHeader eyebrow="Domain" title={data.label} subtitle={`ID: ${data.domainId ?? '-'}`} />
      <div className="dds-card-body">
        <CardSectionLabel>Topics</CardSectionLabel>
        {data.topics?.map((topic) => <TopicRow key={topic.name} topic={topic} />)}
        {!data.topics?.length && <div className="dds-card-empty">No topics</div>}
      </div>
      <Handle className="flow-handle" type="source" position={Position.Right} />
    </div>
  );
}

function ParticipantNode({ data, selected }) {
  const writers = data.endpoints?.filter((endpoint) => endpoint.direction === 'write') ?? [];
  const readers = data.endpoints?.filter((endpoint) => endpoint.direction === 'read') ?? [];
  return (
    <div className={`dds-card dds-card--participant ${selected ? 'selected-node' : ''}`}>
      <Handle className="flow-handle" type="target" position={Position.Left} />
      <CardHeader eyebrow="DomainParticipant" title={data.label} subtitle={data.domainRef} />
      <div className="dds-card-body">
        {writers.length > 0 && <EndpointSection label="DataWriters" endpoints={writers} kind="write" />}
        {readers.length > 0 && <EndpointSection label="DataReaders" endpoints={readers} kind="read" />}
        {!writers.length && !readers.length && <div className="dds-card-empty">No endpoints</div>}
      </div>
      <Handle className="flow-handle" type="source" position={Position.Right} />
    </div>
  );
}

function LibraryNode({ data }) {
  return <div className="dds-library-node">📚 {data.label}</div>;
}

function CardHeader({ eyebrow, title, subtitle }) {
  return <div className="dds-card-header"><div className="dds-card-eyebrow">{eyebrow}</div><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</div>;
}
function CardSectionLabel({ children }) { return <div className="dds-card-section-label">{children}</div>; }
function TopicRow({ topic }) { return <div className="dds-topic-row"><span>◈ {topic.name}</span><small>{topic.typeRef}</small></div>; }
function EndpointSection({ label, endpoints, kind }) { return <><CardSectionLabel>{label}</CardSectionLabel>{endpoints.map((endpoint) => <div className={`dds-endpoint-row dds-endpoint-row--${kind}`} key={`${endpoint.owner}-${endpoint.name}`}><strong>{endpoint.name}</strong><small>topic: {endpoint.topicRef}</small>{endpoint.qosProfileRef && <small>qos: {endpoint.qosProfileRef.split('::').at(-1)}</small>}</div>)}</>; }

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
  typeNode: TypeNode,
  domainNode: DomainNode,
  participantNode: ParticipantNode,
  libraryNode: LibraryNode,
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
  if (node.type === 'typeNode') return '#6392c7';
  if (node.type === 'domainNode') return '#38bdf8';
  if (node.type === 'participantNode') return '#f43f5e';
  if (node.type === 'libraryNode') return '#64748b';
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
