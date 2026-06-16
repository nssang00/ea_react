export const mockUsers = [
  { id: 'u-1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 'u-2', name: 'Modeler Kim', email: 'modeler@example.com', role: 'Modeler' },
  { id: 'u-3', name: 'Reviewer Lee', email: 'reviewer@example.com', role: 'Reviewer' },
];

export const mockProjects = [
  {
    id: 'project-vehicle',
    name: 'Vehicle DDS Model',
    description: '차량 상태 토픽, 구조체 타입, QoS를 관리하는 샘플 프로젝트',
    topicCount: 2,
    typeCount: 2,
    qosCount: 2,
  },
  {
    id: 'project-sensor',
    name: 'Sensor Gateway Model',
    description: '센서 게이트웨이용 토픽과 타입을 관리하는 샘플 프로젝트',
    topicCount: 1,
    typeCount: 1,
    qosCount: 1,
  },
];

const vehicleModel = {
  elementsById: {
    'pkg-dds': {
      id: 'pkg-dds',
      name: 'VehicleDDS',
      type: 'Package',
      parentId: null,
      properties: { description: 'Sparx EA에서 변환되었다고 가정한 DDS 모델 패키지' },
    },
    'participant-main': {
      id: 'participant-main',
      name: 'VehicleParticipant',
      type: 'DomainParticipant',
      parentId: 'pkg-dds',
      properties: { domainId: 0, qosProfile: 'DefaultParticipantQos' },
    },
    'topic-vehicle-status': {
      id: 'topic-vehicle-status',
      name: 'VehicleStatusTopic',
      type: 'Topic',
      parentId: 'pkg-dds',
      properties: {
        dataType: 'VehicleStatus',
        qosProfile: 'ReliableTopicQos',
        reliability: 'RELIABLE',
        durability: 'TRANSIENT_LOCAL',
      },
    },
    'topic-vehicle-command': {
      id: 'topic-vehicle-command',
      name: 'VehicleCommandTopic',
      type: 'Topic',
      parentId: 'pkg-dds',
      properties: {
        dataType: 'VehicleCommand',
        qosProfile: 'CommandTopicQos',
        reliability: 'RELIABLE',
        durability: 'VOLATILE',
      },
    },
    'type-vehicle-status': {
      id: 'type-vehicle-status',
      name: 'VehicleStatus',
      type: 'Struct',
      parentId: 'pkg-dds',
      properties: {
        members: [
          { id: 'm-speed', name: 'speed', type: 'float32', defaultValue: '0.0' },
          { id: 'm-gear', name: 'gear', type: 'int32', defaultValue: '0' },
          { id: 'm-enabled', name: 'enabled', type: 'boolean', defaultValue: 'false' },
        ],
      },
    },
    'type-vehicle-command': {
      id: 'type-vehicle-command',
      name: 'VehicleCommand',
      type: 'Struct',
      parentId: 'pkg-dds',
      properties: {
        members: [
          { id: 'm-target-speed', name: 'targetSpeed', type: 'float32', defaultValue: '0.0' },
          { id: 'm-mode', name: 'mode', type: 'string', defaultValue: 'AUTO' },
        ],
      },
    },
    'qos-reliable': {
      id: 'qos-reliable',
      name: 'ReliableTopicQos',
      type: 'QosProfile',
      parentId: 'pkg-dds',
      properties: {
        reliability: 'RELIABLE',
        durability: 'TRANSIENT_LOCAL',
        qosXml: '<topic_qos>\n  <reliability>RELIABLE</reliability>\n  <durability>TRANSIENT_LOCAL</durability>\n</topic_qos>',
      },
    },
  },
  diagram: {
    nodes: [
      { id: 'participant-main', position: { x: 80, y: 90 } },
      { id: 'topic-vehicle-status', position: { x: 360, y: 60 } },
      { id: 'topic-vehicle-command', position: { x: 360, y: 190 } },
      { id: 'type-vehicle-status', position: { x: 660, y: 60 } },
      { id: 'type-vehicle-command', position: { x: 660, y: 190 } },
      { id: 'qos-reliable', position: { x: 360, y: 340 } },
    ],
    edges: [
      { id: 'e-pub-status', source: 'participant-main', target: 'topic-vehicle-status', label: 'publishes' },
      { id: 'e-sub-command', source: 'participant-main', target: 'topic-vehicle-command', label: 'subscribes' },
      { id: 'e-status-type', source: 'topic-vehicle-status', target: 'type-vehicle-status', label: 'dataType' },
      { id: 'e-command-type', source: 'topic-vehicle-command', target: 'type-vehicle-command', label: 'dataType' },
      { id: 'e-status-qos', source: 'topic-vehicle-status', target: 'qos-reliable', label: 'qos' },
    ],
  },
};

const sensorModel = {
  elementsById: {
    'pkg-sensor': {
      id: 'pkg-sensor',
      name: 'SensorGatewayDDS',
      type: 'Package',
      parentId: null,
      properties: { description: '센서 게이트웨이 샘플 모델' },
    },
    'topic-sensor-frame': {
      id: 'topic-sensor-frame',
      name: 'SensorFrameTopic',
      type: 'Topic',
      parentId: 'pkg-sensor',
      properties: { dataType: 'SensorFrame', qosProfile: 'SensorQos', reliability: 'BEST_EFFORT', durability: 'VOLATILE' },
    },
    'type-sensor-frame': {
      id: 'type-sensor-frame',
      name: 'SensorFrame',
      type: 'Struct',
      parentId: 'pkg-sensor',
      properties: {
        members: [
          { id: 'm-seq', name: 'sequence', type: 'uint32', defaultValue: '0' },
          { id: 'm-value', name: 'value', type: 'float32', defaultValue: '0.0' },
        ],
      },
    },
  },
  diagram: {
    nodes: [
      { id: 'topic-sensor-frame', position: { x: 260, y: 120 } },
      { id: 'type-sensor-frame', position: { x: 560, y: 120 } },
    ],
    edges: [{ id: 'e-sensor-type', source: 'topic-sensor-frame', target: 'type-sensor-frame', label: 'dataType' }],
  },
};

export function getMockModel(projectId) {
  return projectId === 'project-sensor' ? sensorModel : vehicleModel;
}
