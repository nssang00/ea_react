export const mockUsers = [
  { id: 'u-1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 'u-2', name: 'Modeler Kim', email: 'modeler@example.com', role: 'Modeler' },
  { id: 'u-3', name: 'Reviewer Lee', email: 'reviewer@example.com', role: 'Reviewer' },
];

export const mockProjects = [
  {
    id: 'project-vehicle',
    name: 'Vehicle DDS Model',
    description: 'DDS-JSON building blocks for vehicle status and command topics',
    topicCount: 2,
    typeCount: 6,
    qosCount: 2,
  },
  {
    id: 'project-sensor',
    name: 'Sensor Gateway Model',
    description: 'DDS-JSON building blocks for sensor frame publishing',
    topicCount: 1,
    typeCount: 1,
    qosCount: 1,
  },
];

const vehicleDdsJson = {
  types: {
    VehicleDDS: {
      kind: 'module',
      Point3D: {
        kind: 'struct',
        members: [
          { name: 'x', kind: 'float32' },
          { name: 'y', kind: 'float32' },
          { name: 'z', kind: 'float32' },
        ],
      },
      GearMode: {
        kind: 'enum',
        enumerators: [
          { name: 'PARK' },
          { name: 'REVERSE' },
          { name: 'NEUTRAL' },
          { name: 'DRIVE' },
        ],
      },
      VehicleCommandKind: {
        kind: 'enum',
        enumerators: [
          { name: 'SET_SPEED' },
          { name: 'SET_ROUTE' },
          { name: 'EMERGENCY_STOP' },
        ],
      },
      CommandPayload: {
        kind: 'union',
        discriminator: { kind: 'enum', type: 'VehicleDDS::VehicleCommandKind' },
        cases: [
          { name: 'target_speed', labels: ['SET_SPEED'], kind: 'float32' },
          { name: 'route_points', labels: ['SET_ROUTE'], kind: 'sequence', type: 'VehicleDDS::Point3D', sequence_max_length: 32 },
          { name: 'stop_reason', labels: ['EMERGENCY_STOP'], kind: 'string', string_max_length: 64 },
        ],
      },
      VehicleStatus: {
        kind: 'struct',
        annotations: { extensibility: 'appendable' },
        members: [
          { name: 'vehicle_id', kind: 'string', string_max_length: 32, annotations: { key: true } },
          { name: 'speed', kind: 'float32' },
          { name: 'gear', kind: 'enum', type: 'VehicleDDS::GearMode' },
          { name: 'enabled', kind: 'boolean' },
          { name: 'position', kind: 'struct', type: 'VehicleDDS::Point3D' },
          { name: 'wheel_speeds', kind: 'array', type: 'float32', array_dimensions: [4] },
          { name: 'diagnostic_codes', kind: 'sequence', type: 'uint32', sequence_max_length: 16 },
        ],
      },
      VehicleCommand: {
        kind: 'struct',
        annotations: { extensibility: 'appendable' },
        members: [
          { name: 'command_kind', kind: 'enum', type: 'VehicleDDS::VehicleCommandKind' },
          { name: 'payload', kind: 'union', type: 'VehicleDDS::CommandPayload' },
        ],
      },
    },
  },
  qos: {
    qos_library: {
      name: 'VehicleQosLibrary',
      profiles: [
        {
          name: 'ReliableProfile',
          topic_qos: {
            durability: { kind: 'TRANSIENT_LOCAL_DURABILITY_QOS' },
            deadline: { period: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' } },
            latency_budget: { duration: { sec: 0, nanosec: 0 } },
            liveliness: {
              kind: 'AUTOMATIC_LIVELINESS_QOS',
              lease_duration: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' },
            },
            reliability: { kind: 'RELIABLE_RELIABILITY_QOS', max_blocking_time: { sec: 0, nanosec: 100000000 } },
            destination_order: { kind: 'BY_RECEPTION_TIMESTAMP_DESTINATIONORDER_QOS' },
            history: { kind: 'KEEP_LAST_HISTORY_QOS', depth: 16 },
            resource_limits: {
              max_samples: 'LENGTH_UNLIMITED',
              max_instances: 'LENGTH_UNLIMITED',
              max_samples_per_instance: 'LENGTH_UNLIMITED',
            },
            ownership: { kind: 'SHARED_OWNERSHIP_QOS' },
            topic_data: { value: 'VEHICLE_STATUS' },
          },
          datawriter_qos: {
            durability: { kind: 'VOLATILE_DURABILITY_QOS' },
            deadline: { period: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' } },
            latency_budget: { duration: { sec: 0, nanosec: 0 } },
            liveliness: {
              kind: 'AUTOMATIC_LIVELINESS_QOS',
              lease_duration: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' },
            },
            reliability: { kind: 'RELIABLE_RELIABILITY_QOS', max_blocking_time: { sec: 0, nanosec: 100000000 } },
            history: { kind: 'KEEP_LAST_HISTORY_QOS', depth: 16 },
            resource_limits: {
              max_samples: 'LENGTH_UNLIMITED',
              max_instances: 'LENGTH_UNLIMITED',
              max_samples_per_instance: 'LENGTH_UNLIMITED',
            },
            ownership: { kind: 'SHARED_OWNERSHIP_QOS' },
            ownership_strength: { value: 2 },
            transport_priority: { value: 1 },
            lifespan: { duration: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' } },
            writer_data_lifecycle: { autodispose_unregistered_instances: false },
            user_data: { value: 'VEHICLE_WRITER' },
          },
          datareader_qos: {
            durability: { kind: 'VOLATILE_DURABILITY_QOS' },
            deadline: { period: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' } },
            latency_budget: { duration: { sec: 0, nanosec: 0 } },
            liveliness: {
              kind: 'AUTOMATIC_LIVELINESS_QOS',
              lease_duration: { sec: 'DURATION_INFINITE_SEC', nanosec: 'DURATION_INFINITE_NSEC' },
            },
            reliability: { kind: 'RELIABLE_RELIABILITY_QOS', max_blocking_time: { sec: 0, nanosec: 0 } },
            history: { kind: 'KEEP_LAST_HISTORY_QOS', depth: 16 },
            resource_limits: {
              max_samples: 'LENGTH_UNLIMITED',
              max_instances: 1,
              max_samples_per_instance: 'LENGTH_UNLIMITED',
              initial_instances: 1,
              initial_samples: 2,
            },
            ownership: { kind: 'EXCLUSIVE_OWNERSHIP_QOS' },
            time_based_filter: { minimum_separation: { sec: 0, nanosec: 0 } },
            reader_data_lifecycle: {
              autopurge_disposed_samples_delay: { sec: 0, nanosec: 0 },
              autopurge_nowriter_samples_delay: { sec: 0, nanosec: 0 },
            },
            user_data: { value: 'VEHICLE_READER' },
          },
        },
        {
          name: 'VolatileCommandProfile',
          topic_qos: {
            reliability: { kind: 'RELIABLE' },
            durability: { kind: 'VOLATILE' },
          },
        },
      ],
    },
  },
  domains: {
    domain_library: {
      name: 'VehicleDomainLibrary',
      domains: [
        {
          name: 'VehicleDomain',
          domain_id: 0,
          register_types: [
            { name: 'VehicleStatusType', type_ref: 'VehicleDDS::VehicleStatus' },
            { name: 'VehicleCommandType', type_ref: 'VehicleDDS::VehicleCommand' },
          ],
          topics: [
            {
              name: 'VehicleStatusTopic',
              register_type_ref: 'VehicleStatusType',
              topic_qos: { base_name: 'VehicleQosLibrary::ReliableProfile' },
            },
            {
              name: 'VehicleCommandTopic',
              register_type_ref: 'VehicleCommandType',
              topic_qos: { base_name: 'VehicleQosLibrary::VolatileCommandProfile' },
            },
          ],
        },
      ],
    },
  },
  domainParticipants: {
    domain_participant_library: {
      name: 'VehicleParticipantLibrary',
      domain_participants: [
        {
          name: 'VehicleParticipant',
          domain_ref: 'VehicleDomainLibrary::VehicleDomain',
          publishers: [
            {
              name: 'VehiclePublisher',
              data_writers: [
                { name: 'VehicleStatusWriter', topic_ref: 'VehicleStatusTopic' },
              ],
            },
          ],
          subscribers: [
            {
              name: 'VehicleSubscriber',
              data_readers: [
                { name: 'VehicleCommandReader', topic_ref: 'VehicleCommandTopic' },
              ],
            },
          ],
        },
      ],
    },
  },
  applications: {
    application_library: {
      name: 'VehicleApplicationLibrary',
      applications: [
        {
          name: 'VehicleControlApplication',
          domain_participants: [
            {
              name: 'VehicleParticipant',
              domain_ref: 'VehicleDomainLibrary::VehicleDomain',
            },
          ],
        },
      ],
    },
  },
};

const sensorDdsJson = {
  types: {
    SensorDDS: {
      kind: 'module',
      SensorFrame: {
        kind: 'struct',
        members: [
          { name: 'sequence', kind: 'uint32' },
          { name: 'sensor_name', kind: 'string', string_max_length: 32 },
          { name: 'values', kind: 'sequence', type: 'float32', sequence_max_length: 128 },
          { name: 'calibration', kind: 'array', type: 'float32', array_dimensions: [3] },
        ],
      },
    },
  },
  qos: {
    qos_library: {
      name: 'SensorQosLibrary',
      profiles: [
        {
          name: 'BestEffortSensorProfile',
          topic_qos: {
            reliability: { kind: 'BEST_EFFORT' },
            durability: { kind: 'VOLATILE' },
          },
        },
      ],
    },
  },
  domains: {
    domain_library: {
      name: 'SensorDomainLibrary',
      domains: [
        {
          name: 'SensorDomain',
          domain_id: 1,
          register_types: [
            { name: 'SensorFrameType', type_ref: 'SensorDDS::SensorFrame' },
          ],
          topics: [
            {
              name: 'SensorFrameTopic',
              register_type_ref: 'SensorFrameType',
              topic_qos: { base_name: 'SensorQosLibrary::BestEffortSensorProfile' },
            },
          ],
        },
      ],
    },
  },
  domainParticipants: {
    domain_participant_library: {
      name: 'SensorParticipantLibrary',
      domain_participants: [
        {
          name: 'SensorGatewayParticipant',
          domain_ref: 'SensorDomainLibrary::SensorDomain',
          publishers: [
            {
              name: 'SensorPublisher',
              data_writers: [
                { name: 'SensorFrameWriter', topic_ref: 'SensorFrameTopic' },
              ],
            },
          ],
        },
      ],
    },
  },
  applications: {
    application_library: {
      name: 'SensorApplicationLibrary',
      applications: [
        {
          name: 'SensorGatewayApplication',
          domain_participants: [
            {
              name: 'SensorGatewayParticipant',
              domain_ref: 'SensorDomainLibrary::SensorDomain',
            },
          ],
        },
      ],
    },
  },
};

function buildQosElements(profileId, profile) {
  const elements = {};

  Object.entries(profile)
    .filter(([key, value]) => key.endsWith('_qos') && isPlainObject(value))
    .forEach(([key, value]) => {
      collectQosElement(elements, profileId, profileId, [key], value);
    });

  return elements;
}

function collectQosElement(elements, profileId, parentId, path, value) {
  const id = `${profileId}-${path.map(toElementIdPart).join('-')}`;
  const name = path.at(-1);
  const policyPath = path.join('.');

  elements[id] = {
    id,
    name,
    type: 'QosPolicy',
    parentId,
    properties: {
      policyPath,
      qosJson: JSON.stringify(value, null, 2),
      ...primitiveEntries(value),
    },
  };

  Object.entries(value).forEach(([key, childValue]) => {
    const childPath = [...path, key];

    if (isPlainObject(childValue)) {
      collectQosElement(elements, profileId, id, childPath, childValue);
      return;
    }

    const childId = `${id}-${toElementIdPart(key)}`;
    elements[childId] = {
      id: childId,
      name: key,
      type: 'QosValue',
      parentId: id,
      properties: {
        policyPath: childPath.join('.'),
        value: childValue,
      },
    };
  });
}

function primitiveEntries(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => !isPlainObject(item) && !Array.isArray(item))
  );
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toElementIdPart(value) {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

const vehicleModel = {
  ddsJson: vehicleDdsJson,
  elementsById: {
    'pkg-dds': {
      id: 'pkg-dds',
      name: 'VehicleDDS',
      type: 'Module',
      parentId: null,
      properties: { kind: 'module', description: 'DDS-JSON module for vehicle types and entities' },
    },
    'participant-main': {
      id: 'participant-main',
      name: 'VehicleParticipant',
      type: 'DomainParticipant',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.domainParticipants.domain_participant_library.domain_participants[0],
    },
    'domain-vehicle': {
      id: 'domain-vehicle',
      name: 'VehicleDomain',
      type: 'Domain',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.domains.domain_library.domains[0],
    },
    'topic-vehicle-status': {
      id: 'topic-vehicle-status',
      name: 'VehicleStatusTopic',
      type: 'Topic',
      parentId: 'domain-vehicle',
      properties: vehicleDdsJson.domains.domain_library.domains[0].topics[0],
    },
    'topic-vehicle-command': {
      id: 'topic-vehicle-command',
      name: 'VehicleCommandTopic',
      type: 'Topic',
      parentId: 'domain-vehicle',
      properties: vehicleDdsJson.domains.domain_library.domains[0].topics[1],
    },
    'type-point3d': {
      id: 'type-point3d',
      name: 'Point3D',
      type: 'Struct',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.Point3D,
    },
    'type-gear-mode': {
      id: 'type-gear-mode',
      name: 'GearMode',
      type: 'Enum',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.GearMode,
    },
    'type-command-kind': {
      id: 'type-command-kind',
      name: 'VehicleCommandKind',
      type: 'Enum',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.VehicleCommandKind,
    },
    'type-command-payload': {
      id: 'type-command-payload',
      name: 'CommandPayload',
      type: 'Union',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.CommandPayload,
    },
    'type-vehicle-status': {
      id: 'type-vehicle-status',
      name: 'VehicleStatus',
      type: 'Struct',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.VehicleStatus,
    },
    'type-vehicle-command': {
      id: 'type-vehicle-command',
      name: 'VehicleCommand',
      type: 'Struct',
      parentId: 'pkg-dds',
      properties: vehicleDdsJson.types.VehicleDDS.VehicleCommand,
    },
    'qos-reliable': {
      id: 'qos-reliable',
      name: 'ReliableProfile',
      type: 'QosProfile',
      parentId: 'pkg-dds',
      properties: {
        ...vehicleDdsJson.qos.qos_library.profiles[0],
        qosJson: JSON.stringify(vehicleDdsJson.qos.qos_library.profiles[0], null, 2),
      },
    },
    ...buildQosElements('qos-reliable', vehicleDdsJson.qos.qos_library.profiles[0]),
    'qos-command': {
      id: 'qos-command',
      name: 'VolatileCommandProfile',
      type: 'QosProfile',
      parentId: 'pkg-dds',
      properties: {
        ...vehicleDdsJson.qos.qos_library.profiles[1],
        qosJson: JSON.stringify(vehicleDdsJson.qos.qos_library.profiles[1], null, 2),
      },
    },
    ...buildQosElements('qos-command', vehicleDdsJson.qos.qos_library.profiles[1]),
  },
  diagram: {
    nodes: [
      { id: 'participant-main', position: { x: 80, y: 110 } },
      { id: 'topic-vehicle-status', position: { x: 360, y: 60 } },
      { id: 'topic-vehicle-command', position: { x: 360, y: 190 } },
      { id: 'type-vehicle-status', position: { x: 660, y: 60 } },
      { id: 'type-vehicle-command', position: { x: 660, y: 190 } },
      { id: 'qos-reliable', position: { x: 360, y: 340 } },
    ],
    edges: [
      { id: 'e-pub-status', source: 'participant-main', target: 'topic-vehicle-status', label: 'publishes' },
      { id: 'e-sub-command', source: 'participant-main', target: 'topic-vehicle-command', label: 'subscribes' },
      { id: 'e-status-type', source: 'topic-vehicle-status', target: 'type-vehicle-status', label: 'type' },
      { id: 'e-command-type', source: 'topic-vehicle-command', target: 'type-vehicle-command', label: 'type' },
      { id: 'e-status-qos', source: 'topic-vehicle-status', target: 'qos-reliable', label: 'qos' },
    ],
  },
};

const sensorModel = {
  ddsJson: sensorDdsJson,
  elementsById: {
    'pkg-sensor': {
      id: 'pkg-sensor',
      name: 'SensorDDS',
      type: 'Module',
      parentId: null,
      properties: { kind: 'module', description: 'DDS-JSON module for sensor gateway entities' },
    },
    'topic-sensor-frame': {
      id: 'topic-sensor-frame',
      name: 'SensorFrameTopic',
      type: 'Topic',
      parentId: 'domain-sensor',
      properties: sensorDdsJson.domains.domain_library.domains[0].topics[0],
    },
    'domain-sensor': {
      id: 'domain-sensor',
      name: 'SensorDomain',
      type: 'Domain',
      parentId: 'pkg-sensor',
      properties: sensorDdsJson.domains.domain_library.domains[0],
    },
    'type-sensor-frame': {
      id: 'type-sensor-frame',
      name: 'SensorFrame',
      type: 'Struct',
      parentId: 'pkg-sensor',
      properties: sensorDdsJson.types.SensorDDS.SensorFrame,
    },
    'qos-sensor': {
      id: 'qos-sensor',
      name: 'BestEffortSensorProfile',
      type: 'QosProfile',
      parentId: 'pkg-sensor',
      properties: {
        ...sensorDdsJson.qos.qos_library.profiles[0],
        qosJson: JSON.stringify(sensorDdsJson.qos.qos_library.profiles[0], null, 2),
      },
    },
    ...buildQosElements('qos-sensor', sensorDdsJson.qos.qos_library.profiles[0]),
  },
  diagram: {
    nodes: [
      { id: 'topic-sensor-frame', position: { x: 260, y: 120 } },
      { id: 'type-sensor-frame', position: { x: 560, y: 120 } },
      { id: 'qos-sensor', position: { x: 260, y: 300 } },
    ],
    edges: [
      { id: 'e-sensor-type', source: 'topic-sensor-frame', target: 'type-sensor-frame', label: 'type' },
      { id: 'e-sensor-qos', source: 'topic-sensor-frame', target: 'qos-sensor', label: 'qos' },
    ],
  },
};

export function getMockModel(projectId) {
  return projectId === 'project-sensor' ? sensorModel : vehicleModel;
}
