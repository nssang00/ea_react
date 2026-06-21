import { useEffect, useMemo } from 'react';
import { MarkerType, Position, useNodesState } from '@xyflow/react';
import { useWorkbenchModel } from './useWorkbenchModel.js';

export function useDiagramModel() {
  const { activeExplorerViewId, model, selectedElementId, selectElement, updateQosProperty } = useWorkbenchModel();

  const computedNodes = useMemo(() => {
    if (!model) return [];

    return buildDiagram(model, activeExplorerViewId, selectedElementId).nodes
      .map((node) => toFlowNode(node, model, selectedElementId));
  }, [activeExplorerViewId, model, selectedElementId]);
  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);

  useEffect(() => {
    setNodes((currentNodes) => {
      const currentPositionById = Object.fromEntries(
        currentNodes.map((node) => [node.id, node.position])
      );

      return computedNodes.map((node) => ({
        ...node,
        position: currentPositionById[node.id] ?? node.position,
      }));
    });
  }, [computedNodes, setNodes]);

  const edges = useMemo(() => {
    if (!model) return [];

    return buildDiagram(model, activeExplorerViewId, selectedElementId).edges.map((edge) => ({
      ...edge,
      type: edge.type ?? 'smoothstep',
      markerEnd: edge.markerEnd === undefined ? { type: MarkerType.ArrowClosed } : edge.markerEnd,
      animated: edge.source === selectedElementId || edge.target === selectedElementId,
    }));
  }, [activeExplorerViewId, model, selectedElementId]);

  return {
    nodes,
    edges,
    hasModel: Boolean(model),
    onNodesChange,
    selectElement,
    updateQosProperty,
  };
}

function buildDiagram(model, activeExplorerViewId, selectedElementId) {
  if (activeExplorerViewId === 'types') {
    return buildTypeDiagram(model);
  }

  if (activeExplorerViewId === 'qos') {
    return buildQosDiagram(model, selectedElementId);
  }

  if (activeExplorerViewId === 'domains') {
    return buildDomainDiagram(model);
  }

  if (activeExplorerViewId === 'participants') {
    return buildParticipantDiagram(model);
  }

  return model.diagram;
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
    data: {
      label: element?.name ?? node.id,
      type: element?.type ?? 'Unknown',
      ...node.data,
    },
  };
}

function buildTypeDiagram(model) {
  const modules = elementsOfType(model, 'Module');
  const typeElements = ['Struct', 'Union', 'Enum'].flatMap((type) => elementsOfType(model, type));
  const moduleIds = modules.map((module) => module.id);
  const ungroupedTypes = typeElements.filter((element) => !moduleIds.includes(element.parentId));

  return {
    nodes: [
      ...modules.map((module, moduleIndex) => {
        const children = typeElements.filter((element) => element.parentId === module.id);
        const rows = Math.max(1, Math.ceil(children.length / 2));

        return diagramGroupNode(
          `group-${module.id}`,
          module.name,
          40,
          40 + moduleIndex * Math.max(260, rows * 170 + 90),
          660,
          Math.max(220, rows * 170 + 70)
        );
      }),
      ...modules.flatMap((module, moduleIndex) => {
        const children = typeElements.filter((element) => element.parentId === module.id);
        const baseY = 90 + moduleIndex * Math.max(260, Math.ceil(Math.max(1, children.length) / 2) * 170 + 90);

        return children.map((element, index) => (
          entityNode(
            element.id,
            typeVariant(element.type),
            element.type,
            element.name,
            90 + (index % 2) * 300,
            baseY + Math.floor(index / 2) * 160,
            typeRows(element),
            element.id
          )
        ));
      }),
      ...ungroupedTypes.map((element, index) => (
        entityNode(
          element.id,
          typeVariant(element.type),
          element.type,
          element.name,
          760,
          80 + index * 160,
          typeRows(element),
          element.id
        )
      )),
    ],
    edges: [
      ...typeElements.flatMap((typeElement) => {
        if (typeElement.type !== 'Struct') return [];

        const members = typeElement.properties.members || [];
        return members
          .filter((member) => member.type)
          .map((member) => {
            const target = findTypeByQualifiedName(model, member.type);
            if (!target) return null;
            return {
              id: `e-${typeElement.id}-${target.id}-${member.name}`,
              source: typeElement.id,
              target: target.id,
              label: member.name,
              className: `qos-edge qos-edge--${typeVariant(target.type)}`,
            };
          })
          .filter(Boolean);
      }),
    ],
  };
}

function buildQosDiagram(model, selectedElementId) {
  const qosProfiles = elementsOfType(model, 'QosProfile');
  const focusedProfile = findFocusedQosProfile(model, qosProfiles, selectedElementId) ?? qosProfiles[0];
  if (!focusedProfile) return { nodes: [], edges: [] };

  return buildQosComfyDiagram(model, focusedProfile);
}

function findFocusedQosProfile(model, qosProfiles, selectedElementId) {
  let current = model.elementsById[selectedElementId];

  if (current?.type === 'Topic') {
    return findTopicQosProfile(current, qosProfiles);
  }

  while (current) {
    if (current.type === 'QosProfile') return current;
    current = model.elementsById[current.parentId];
  }

  return null;
}

function findTopicQosProfile(topic, qosProfiles) {
  const qosBaseName = topic.properties?.topic_qos?.base_name;
  return qosProfiles.find((item) => qosBaseName?.endsWith(`::${item.name}`));
}

function buildQosComfyDiagram(model, profile) {
  const nodes = [
    entityNode(`${profile.id}-library`, 'library', 'QoS Library', 'DDS QoS Library', 40, 300, [
      readOnlyRow('profile', profile.name),
      readOnlyRow('scope', model.ddsJson?.qos?.qos_library?.name ?? 'qos_library'),
    ], profile.id),
    entityNode(profile.id, 'profile', 'QoS Profile', profile.name, 300, 300, profileRows(profile), profile.id),
    ...qosEntityNodes(model, profile),
  ];

  const edges = [
    qosEntityEdge(`${profile.id}-library`, profile.id, 'library', 'profile'),
    ...qosEntityEdges(profile),
  ];

  return { nodes, edges };
}

const QOS_ENTITY_SPECS = [
  { key: 'domain_participant_qos', variant: 'participant', title: 'DomainParticipant QoS', x: 560, y: 40 },
  { key: 'topic_qos', variant: 'topic', title: 'Topic QoS', x: 560, y: 260 },
  { key: 'publisher_qos', variant: 'publisher', title: 'Publisher QoS', x: 560, y: 480 },
  { key: 'subscriber_qos', variant: 'subscriber', title: 'Subscriber QoS', x: 940, y: 40 },
  { key: 'datawriter_qos', variant: 'datawriter', title: 'DataWriter QoS', x: 940, y: 260 },
  { key: 'datareader_qos', variant: 'datareader', title: 'DataReader QoS', x: 940, y: 480 },
];

function qosEntityNodes(model, profile) {
  const participant = elementsOfType(model, 'DomainParticipant')[0];
  const appliedTopics = elementsOfType(model, 'Topic')
    .filter((topic) => findTopicQosProfile(topic, [profile]));
  const primaryTopic = appliedTopics[0] ?? elementsOfType(model, 'Topic')[0];
  const publisher = participant?.properties?.publishers?.[0];
  const subscriber = participant?.properties?.subscribers?.[0];
  const writer = publisher?.data_writers?.find((item) => item.topic_ref === primaryTopic?.name)
    ?? publisher?.data_writers?.[0];
  const reader = subscriber?.data_readers?.find((item) => item.topic_ref === primaryTopic?.name)
    ?? subscriber?.data_readers?.[0];

  const fallbackRows = {
    domain_participant_qos: [
      readOnlyRow('name', participant?.name ?? 'DomainParticipant'),
      readOnlyRow('domain', participant?.properties?.domain_ref),
    ],
    topic_qos: [
      readOnlyRow('topic', primaryTopic?.name ?? 'Topic'),
      readOnlyRow('type', primaryTopic?.properties?.register_type_ref),
      ...flattenRows(profile.properties?.topic_qos, '', { profileId: profile.id, entityKey: 'topic_qos' }),
    ],
    publisher_qos: [
      readOnlyRow('name', publisher?.name ?? 'Publisher'),
      readOnlyRow('writers', publisher?.data_writers?.length ?? 0),
    ],
    subscriber_qos: [
      readOnlyRow('name', subscriber?.name ?? 'Subscriber'),
      readOnlyRow('readers', subscriber?.data_readers?.length ?? 0),
    ],
    datawriter_qos: [
      readOnlyRow('writer', writer?.name ?? 'DataWriter'),
      readOnlyRow('topic', writer?.topic_ref ?? primaryTopic?.name),
      ...flattenRows(profile.properties?.datawriter_qos, '', { profileId: profile.id, entityKey: 'datawriter_qos' }),
    ],
    datareader_qos: [
      readOnlyRow('reader', reader?.name ?? 'DataReader'),
      readOnlyRow('topic', reader?.topic_ref ?? primaryTopic?.name),
      ...flattenRows(profile.properties?.datareader_qos, '', { profileId: profile.id, entityKey: 'datareader_qos' }),
    ],
  };

  return QOS_ENTITY_SPECS.map((spec) => {
    const profileRowsForEntity = flattenRows(profile.properties?.[spec.key], '', {
      profileId: profile.id,
      entityKey: spec.key,
    });
    const rows = profileRowsForEntity.length > 0 ? profileRowsForEntity : fallbackRows[spec.key];

    return entityNode(
      `${profile.id}-${spec.key}`,
      spec.variant,
      spec.title,
      spec.key.replace(/_qos$/, '').replace(/_/g, ' '),
      spec.x,
      spec.y,
      rows,
      profile.id
    );
  });
}

function qosEntityEdges(profile) {
  return [
    qosEntityEdge(profile.id, `${profile.id}-domain_participant_qos`, 'profile', 'participant'),
    qosEntityEdge(profile.id, `${profile.id}-topic_qos`, 'profile', 'topic'),
    qosEntityEdge(profile.id, `${profile.id}-publisher_qos`, 'profile', 'publisher'),
    qosEntityEdge(profile.id, `${profile.id}-subscriber_qos`, 'profile', 'subscriber'),
    qosEntityEdge(profile.id, `${profile.id}-datawriter_qos`, 'profile', 'datawriter'),
    qosEntityEdge(profile.id, `${profile.id}-datareader_qos`, 'profile', 'datareader'),
    qosEntityEdge(`${profile.id}-domain_participant_qos`, `${profile.id}-publisher_qos`, 'participant', 'creates'),
    qosEntityEdge(`${profile.id}-domain_participant_qos`, `${profile.id}-subscriber_qos`, 'participant', 'creates'),
    qosEntityEdge(`${profile.id}-topic_qos`, `${profile.id}-datawriter_qos`, 'topic', 'topic'),
    qosEntityEdge(`${profile.id}-topic_qos`, `${profile.id}-datareader_qos`, 'topic', 'topic'),
    qosEntityEdge(`${profile.id}-publisher_qos`, `${profile.id}-datawriter_qos`, 'publisher', 'writer'),
    qosEntityEdge(`${profile.id}-subscriber_qos`, `${profile.id}-datareader_qos`, 'subscriber', 'reader'),
  ];
}

function entityNode(id, variant, label, subtitle, x, y, rows, selectId) {
  return {
    id,
    nodeType: 'qosNode',
    position: { x, y },
    width: variant === 'library' || variant === 'profile' ? 220 : 310,
    height: 132,
    data: {
      label,
      type: subtitle,
      variant,
      selectId,
      fields: rows.filter((row) => row.value !== undefined),
    },
  };
}

function qosEntityEdge(source, target, variant, label) {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    label,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    className: `qos-edge qos-edge--${variant}`,
  };
}

function profileRows(profile) {
  return [
    readOnlyRow('name', profile.name),
    readOnlyRow('base', profile.properties?.base_name),
    readOnlyRow('policies', Object.keys(profile.properties || {}).filter((key) => key.endsWith('_qos')).length),
  ];
}

function diagramGroupNode(id, label, x, y, width, height) {
  return {
    id,
    nodeType: 'diagramGroup',
    position: { x, y },
    width,
    height,
    draggable: false,
    selectable: false,
    zIndex: 0,
    data: {
      label,
      type: 'Module',
    },
  };
}

function typeVariant(type) {
  return type.toLowerCase();
}

function typeRows(typeElement) {
  return [
    readOnlyRow('kind', typeElement.properties?.kind),
    readOnlyRow('members', typeElement.properties?.members?.length ?? 0),
    readOnlyRow('enumerators', typeElement.properties?.enumerators?.length),
    readOnlyRow('cases', typeElement.properties?.cases?.length),
    readOnlyRow('discriminator', typeElement.properties?.discriminator?.type),
    readOnlyRow('extensibility', typeElement.properties?.annotations?.extensibility),
  ];
}

function domainRows(domain) {
  return [
    readOnlyRow('domain_id', domain.properties?.domain_id),
    readOnlyRow('register_types', domain.properties?.register_types?.length ?? 0),
    readOnlyRow('topics', domain.properties?.topics?.length ?? 0),
  ];
}

function topicRows(topic) {
  return [
    readOnlyRow('register_type_ref', topic.properties?.register_type_ref),
    readOnlyRow('qos', topic.properties?.topic_qos?.base_name?.split('::').pop()),
  ];
}

function participantRows(participant) {
  return [
    readOnlyRow('domain_ref', participant.properties?.domain_ref),
    readOnlyRow('publishers', participant.properties?.publishers?.length ?? 0),
    readOnlyRow('subscribers', participant.properties?.subscribers?.length ?? 0),
  ];
}

function publisherRows(publisher) {
  return [
    readOnlyRow('writers', publisher.data_writers?.length ?? 0),
  ];
}

function subscriberRows(subscriber) {
  return [
    readOnlyRow('readers', subscriber.data_readers?.length ?? 0),
  ];
}

function endpointRows(endpoint) {
  return [
    readOnlyRow('topic_ref', endpoint.topic_ref),
  ];
}

function flattenRows(value, prefix = '', editMeta = null) {
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, childValue]) => {
    if (key === 'name' || key === 'topic_filter') return [];

    const path = prefix ? `${prefix}.${key}` : key;
    if (childValue && typeof childValue === 'object' && !Array.isArray(childValue)) {
      return flattenRows(childValue, path, editMeta);
    }

    return [editableRow(path, Array.isArray(childValue) ? childValue.join(', ') : childValue, editMeta)];
  });
}

function editableRow(key, value, editMeta) {
  return {
    key,
    value,
    editable: Boolean(editMeta),
    ...editMeta,
  };
}

function readOnlyRow(key, value) {
  return { key, value, editable: false };
}

function buildDomainDiagram(model) {
  const domains = elementsOfType(model, 'Domain');
  const topics = elementsOfType(model, 'Topic');
  const structs = elementsOfType(model, 'Struct');
  const registerTypes = domains.flatMap((domain) => domain.properties?.register_types || []);

  return {
    nodes: [
      ...domains.map((domain, index) => (
        entityNode(domain.id, 'domain', 'Domain', domain.name, 80, 120 + index * 260, domainRows(domain), domain.id)
      )),
      ...registerTypes.map((registerType, index) => (
        entityNode(
          `register-type-${registerType.name}`,
          'registerType',
          registerType.name,
          'Registered Type',
          370,
          80 + index * 150,
          [
            readOnlyRow('name', registerType.name),
            readOnlyRow('type_ref', registerType.type_ref),
          ],
          findStructByQualifiedName(model, registerType.type_ref)?.id
        )
      )),
      ...topics.map((topic, index) => (
        entityNode(topic.id, 'topic', 'Topic', topic.name, 660, 80 + index * 150, topicRows(topic), topic.id)
      )),
      ...structs.map((struct, index) => (
        entityNode(struct.id, 'struct', 'Struct', struct.name, 960, 80 + index * 150, typeRows(struct), struct.id)
      )),
    ],
    edges: [
      ...domains.flatMap((domain) => (
        (domain.properties?.register_types || []).map((registerType) => ({
          id: `e-${domain.id}-register-${registerType.name}`,
          source: domain.id,
          target: `register-type-${registerType.name}`,
          label: 'registers',
          className: 'qos-edge qos-edge--domain',
        }))
      )),
      ...topics.map((topic) => {
        const registerType = registerTypes.find((item) => item.name === topic.properties?.register_type_ref);
        return {
          id: `e-register-${registerType?.name}-${topic.id}`,
          source: registerType ? `register-type-${registerType.name}` : topic.parentId,
          target: topic.id,
          label: 'topic',
          className: 'qos-edge qos-edge--registerType',
        };
      }),
      ...topics
        .map((topic) => {
          const typeName = topic.properties?.register_type_ref?.replace(/Type$/, '');
          const target = structs.find((struct) => struct.name === typeName);
          if (!target) return null;
          return {
            id: `e-${topic.id}-${target.id}`,
            source: topic.id,
            target: target.id,
            label: 'type',
            className: 'qos-edge qos-edge--topic',
          };
        })
        .filter(Boolean),
    ],
  };
}

function buildParticipantDiagram(model) {
  const participants = elementsOfType(model, 'DomainParticipant');
  const topics = elementsOfType(model, 'Topic');

  return {
    nodes: [
      ...participants.map((participant, index) => (
        entityNode(participant.id, 'participant', 'DomainParticipant', participant.name, 80, 160 + index * 260, participantRows(participant), participant.id)
      )),
      ...participants.flatMap((participant, participantIndex) => (
        [
          ...(participant.properties.publishers || []).map((publisher, index) => (
            entityNode(
              `${participant.id}-publisher-${publisher.name}`,
              'publisher',
              'Publisher',
              publisher.name,
              390,
              80 + participantIndex * 300 + index * 150,
              publisherRows(publisher),
              participant.id
            )
          )),
          ...(participant.properties.subscribers || []).map((subscriber, index) => (
            entityNode(
              `${participant.id}-subscriber-${subscriber.name}`,
              'subscriber',
              'Subscriber',
              subscriber.name,
              390,
              230 + participantIndex * 300 + index * 150,
              subscriberRows(subscriber),
              participant.id
            )
          )),
        ]
      )),
      ...participants.flatMap((participant, participantIndex) => (
        [
          ...(participant.properties.publishers || []).flatMap((publisher, publisherIndex) => (
            (publisher.data_writers || []).map((writer, writerIndex) => (
              entityNode(
                `${participant.id}-writer-${writer.name}`,
                'datawriter',
                'DataWriter',
                writer.name,
                700,
                70 + participantIndex * 320 + publisherIndex * 150 + writerIndex * 92,
                endpointRows(writer),
                participant.id
              )
            ))
          )),
          ...(participant.properties.subscribers || []).flatMap((subscriber, subscriberIndex) => (
            (subscriber.data_readers || []).map((reader, readerIndex) => (
              entityNode(
                `${participant.id}-reader-${reader.name}`,
                'datareader',
                'DataReader',
                reader.name,
                700,
                230 + participantIndex * 320 + subscriberIndex * 150 + readerIndex * 92,
                endpointRows(reader),
                participant.id
              )
            ))
          )),
        ]
      )),
      ...topics.map((topic, index) => (
        entityNode(topic.id, 'topic', 'Topic', topic.name, 1010, 100 + index * 140, topicRows(topic), topic.id)
      )),
    ],
    edges: participants.flatMap((participant) => {
      const publishers = participant.properties.publishers || [];
      const subscribers = participant.properties.subscribers || [];

      return [
        ...publishers.map((publisher) => ({
          id: `e-${participant.id}-${publisher.name}`,
          source: participant.id,
          target: `${participant.id}-publisher-${publisher.name}`,
          label: 'publisher',
          className: 'qos-edge qos-edge--participant',
        })),
        ...subscribers.map((subscriber) => ({
          id: `e-${participant.id}-${subscriber.name}`,
          source: participant.id,
          target: `${participant.id}-subscriber-${subscriber.name}`,
          label: 'subscriber',
          className: 'qos-edge qos-edge--participant',
        })),
        ...publishers.flatMap((publisher) => (
          (publisher.data_writers || []).map((writer) => ({
            id: `e-${publisher.name}-${writer.name}`,
            source: `${participant.id}-publisher-${publisher.name}`,
            target: `${participant.id}-writer-${writer.name}`,
            label: 'writer',
            className: 'qos-edge qos-edge--publisher',
          }))
        )),
        ...subscribers.flatMap((subscriber) => (
          (subscriber.data_readers || []).map((reader) => ({
            id: `e-${subscriber.name}-${reader.name}`,
            source: `${participant.id}-subscriber-${subscriber.name}`,
            target: `${participant.id}-reader-${reader.name}`,
            label: 'reader',
            className: 'qos-edge qos-edge--subscriber',
          }))
        )),
        ...publishers.flatMap((publisher) => (
          (publisher.data_writers || []).map((writer) => topicEdge(model, `${participant.id}-writer-${writer.name}`, writer.topic_ref, 'writes'))
        )),
        ...subscribers.flatMap((subscriber) => (
          (subscriber.data_readers || []).map((reader) => topicEdge(model, `${participant.id}-reader-${reader.name}`, reader.topic_ref, 'reads'))
        )),
      ].filter(Boolean);
    }),
  };
}

function topicEdge(model, sourceId, topicName, label) {
  const topic = elementsOfType(model, 'Topic').find((item) => item.name === topicName);
  if (!topic) return null;

  return {
    id: `e-${sourceId}-${topic.id}-${label}`,
    source: sourceId,
    target: topic.id,
    label,
    className: label === 'writes' ? 'qos-edge qos-edge--datawriter' : 'qos-edge qos-edge--datareader',
  };
}

function elementsOfType(model, type) {
  return Object.values(model.elementsById).filter((element) => element.type === type);
}

function findStructByQualifiedName(model, qualifiedName) {
  const name = qualifiedName.split('::').pop();
  return elementsOfType(model, 'Struct').find((struct) => struct.name === name);
}

function findTypeByQualifiedName(model, qualifiedName) {
  const name = qualifiedName.split('::').pop();
  return ['Struct', 'Union', 'Enum']
    .flatMap((type) => elementsOfType(model, type))
    .find((element) => element.name === name);
}
