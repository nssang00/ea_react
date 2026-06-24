// Pure model -> diagram descriptions. XYFlow conversion and UI callbacks belong
// to useDiagramModel/ModelDiagram, not to this module.
const builders = {
  types: buildTypeDiagram,
  qos: buildQosDiagram,
  domains: buildDomainDiagram,
  participants: buildParticipantDiagram,
  model: (model) => model?.diagram ?? { nodes: [], edges: [] },
};

export function buildDiagram(model, activeExplorerViewId, selectedElementId) {
  return (builders[activeExplorerViewId] ?? builders.model)(model, selectedElementId);
}

export function buildTypeDiagram(model) {
  const types = typeElements(model);
  const edges = [];
  const nodes = types.map((item, index) => typeNode(item, 60 + index * 340, 80));

  types.filter((item) => ['Struct', 'Union'].includes(item.type)).forEach((item) => {
    typeReferences(item).forEach(({ name, type }) => {
      const target = findType(model, type);
      if (target) edges.push(edge(item.id, target.id, name, `qos-edge qos-edge--${variant(target.type)}`));
    });
  });
  return { nodes, edges };
}

export function buildQosDiagram(model, selectedElementId) {
  const profiles = elementsOf(model, 'QosProfile');
  const profile = focusedProfile(model, profiles, selectedElementId) ?? profiles[0];
  if (!profile) return { nodes: [], edges: [] };

  const participant = elementsOf(model, 'DomainParticipant')[0];
  const topics = elementsOf(model, 'Topic');
  const topic = topics.find((item) => hasProfile(item, profile)) ?? topics[0];
  const publisher = participant?.properties?.publishers?.[0];
  const subscriber = participant?.properties?.subscribers?.[0];
  const writer = publisher?.data_writers?.find((item) => item.topic_ref === topic?.name) ?? publisher?.data_writers?.[0];
  const reader = subscriber?.data_readers?.find((item) => item.topic_ref === topic?.name) ?? subscriber?.data_readers?.[0];
  const specs = [
    ['domain_participant_qos', 'participant', 'DomainParticipant QoS', 600, 40],
    ['topic_qos', 'topic', 'Topic QoS', 600, 430],
    ['publisher_qos', 'publisher', 'Publisher QoS', 600, 820],
    ['subscriber_qos', 'subscriber', 'Subscriber QoS', 1000, 40],
    ['datawriter_qos', 'datawriter', 'DataWriter QoS', 1000, 430],
    ['datareader_qos', 'datareader', 'DataReader QoS', 1000, 820],
  ];
  const fallbackRows = {
    domain_participant_qos: [row('name', participant?.name ?? 'DomainParticipant'), row('domain', participant?.properties?.domain_ref)],
    topic_qos: [row('topic', topic?.name ?? 'Topic'), row('type', topic?.properties?.register_type_ref)],
    publisher_qos: [row('name', publisher?.name ?? 'Publisher'), row('writers', publisher?.data_writers?.length ?? 0)],
    subscriber_qos: [row('name', subscriber?.name ?? 'Subscriber'), row('readers', subscriber?.data_readers?.length ?? 0)],
    datawriter_qos: [row('writer', writer?.name ?? 'DataWriter'), row('topic', writer?.topic_ref ?? topic?.name)],
    datareader_qos: [row('reader', reader?.name ?? 'DataReader'), row('topic', reader?.topic_ref ?? topic?.name)],
  };
  const nodes = [
    entityNode(`${profile.id}-library`, 'library', 'QoS Library', 'DDS QoS Library', 40, 430, [row('profile', profile.name)], profile.id),
    entityNode(profile.id, 'profile', 'QoS Profile', profile.name, 320, 430, profileRows(profile), profile.id),
    ...specs.map(([key, kind, title, x, y]) => {
      const fields = editableRows(profile.properties?.[key], profile.id, key);
      return entityNode(`${profile.id}-${key}`, kind, title, key.replace(/_qos$/, '').replace(/_/g, ' '), x, y, fields.length ? fields : fallbackRows[key], profile.id);
    }),
  ];
  const ids = Object.fromEntries(specs.map(([key]) => [key, `${profile.id}-${key}`]));
  const edges = [edge(`${profile.id}-library`, profile.id, 'profile', 'qos-edge qos-edge--library')];
  specs.forEach(([key, kind]) => edges.push(edge(profile.id, ids[key], 'profile', `qos-edge qos-edge--${kind}`)));
  [
    ['domain_participant_qos', 'publisher_qos', 'creates'], ['domain_participant_qos', 'subscriber_qos', 'creates'],
    ['topic_qos', 'datawriter_qos', 'topic'], ['topic_qos', 'datareader_qos', 'topic'],
    ['publisher_qos', 'datawriter_qos', 'writer'], ['subscriber_qos', 'datareader_qos', 'reader'],
  ].forEach(([source, target, label]) => edges.push(edge(ids[source], ids[target], label, 'qos-edge')));
  return { nodes, edges };
}

export function buildDomainDiagram(model) {
  const domains = elementsOf(model, 'Domain');
  return {
    nodes: domains.map((domain, index) => ({
      id: domain.id,
      nodeType: 'domainNode',
      position: { x: 60, y: 50 + index * 290 },
      width: 300,
      data: {
        label: domain.name,
        domainId: domain.properties?.domain_id,
        selectId: domain.id,
        topics: elementsOf(model, 'Topic')
          .filter((topic) => topic.parentId === domain.id)
          .map((topic) => ({ name: topic.name, typeRef: topic.properties?.register_type_ref })),
      },
    })),
    edges: [],
  };
}

export function buildParticipantDiagram(model) {
  const participants = elementsOf(model, 'DomainParticipant');
  const nodes = participants.map((participant, index) => participantNode(participant, 60 + index * 330, 80));
  const edges = [];
  const writers = participants.flatMap((participant) => participantEndpoints(participant).filter((endpoint) => endpoint.direction === 'write').map((endpoint) => ({ participant, endpoint })));
  const readers = participants.flatMap((participant) => participantEndpoints(participant).filter((endpoint) => endpoint.direction === 'read').map((endpoint) => ({ participant, endpoint })));
  writers.forEach((writer) => {
    readers.forEach((reader) => {
      if (writer.endpoint.topicRef !== reader.endpoint.topicRef) return;
      edges.push({
        ...edge(writer.participant.id, reader.participant.id, writer.endpoint.topicRef, 'qos-edge qos-edge--datawriter'),
        animated: true,
      });
    });
  });
  return { nodes, edges };
}

function typeNode(item, x, y) {
  const node = entityNode(item.id, variant(item.type), item.type, item.name, x, y, typeRows(item), item.id);
  return {
    ...node,
    nodeType: 'typeNode',
    data: { ...node.data, stereotype: item.type.toLowerCase() },
  };
}
function libraryNode(library, x, y) { return { id: library.id, nodeType: 'libraryNode', position: { x, y }, width: 190, data: { label: library.name, selectId: library.id } }; }
function participantNode(participant, x, y) { return { id: participant.id, nodeType: 'participantNode', position: { x, y }, width: 280, data: { label: participant.name, domainRef: participant.properties?.domain_ref, endpoints: participantEndpoints(participant), selectId: participant.id } }; }
function participantEndpoints(participant) { return [
  ...(participant.properties?.publishers ?? []).flatMap((publisher) => (publisher.data_writers ?? []).map((writer) => ({ direction: 'write', owner: publisher.name, name: writer.name, topicRef: writer.topic_ref, qosProfileRef: writer.qos_profile_ref }))),
  ...(participant.properties?.subscribers ?? []).flatMap((subscriber) => (subscriber.data_readers ?? []).map((reader) => ({ direction: 'read', owner: subscriber.name, name: reader.name, topicRef: reader.topic_ref, qosProfileRef: reader.qos_profile_ref }))),
]; }
function entityNode(id, kind, label, subtitle, x, y, fields, selectId) {
  const visibleFields = fields.filter((item) => item.value !== undefined);
  return { id, nodeType: 'qosNode', position: { x, y }, width: kind === 'library' || kind === 'profile' ? 220 : 310,
    height: Math.max(132, Math.min(360, 76 + visibleFields.length * 29)), data: { label, type: subtitle, variant: kind, selectId, fields: visibleFields } };
}
function containerNode(id, label, x, y, width, height) { return { id, nodeType: 'diagramGroup', position: { x, y }, width, height, draggable: false, selectable: false, zIndex: 0, data: { label, type: 'Module', isContainer: true } }; }
function edge(source, target, label, className) { return { id: `e-${source}-${target}-${label}`, source, target, label, className }; }
function row(key, value) { return { key, value, editable: false }; }
function elementsOf(model, type) { return Object.values(model?.elementsById ?? {}).filter((item) => item.type === type); }
function typeElements(model) { return ['Struct', 'Union', 'Enum', 'Bitmask', 'Typedef'].flatMap((type) => elementsOf(model, type)); }
function variant(type) { return type.toLowerCase(); }
function typeRows(item) {
  if (item.type === 'Enum' || item.type === 'Bitmask') return (item.properties?.enumerators ?? item.properties?.values ?? []).map((value) => row(value.name ?? String(value), value.value));
  const members = item.properties?.members ?? item.properties?.cases ?? [];
  if (members.length) return members.map((member) => row(member.name, member.type?.name ?? member.type ?? member.default ?? ''));
  return [row('kind', item.properties?.kind), row('extensibility', item.properties?.annotations?.extensibility)];
}
function typeReferences(item) { return (item.properties?.members ?? item.properties?.cases ?? []).map((member) => ({ name: member.name, type: member.type?.name ?? member.type })); }
function domainRows(item) { return [row('domain_id', item.properties?.domain_id), row('register_types', item.properties?.register_types?.length ?? 0), row('topics', item.properties?.topics?.length ?? 0)]; }
function topicRows(item) { return [row('register_type_ref', item.properties?.register_type_ref), row('qos', item.properties?.topic_qos?.base_name?.split('::').pop())]; }
function participantRows(item) { return [row('domain_ref', item.properties?.domain_ref), row('publishers', item.properties?.publishers?.length ?? 0), row('subscribers', item.properties?.subscribers?.length ?? 0)]; }
function profileRows(profile) { return [row('name', profile.name), row('base', profile.properties?.base_name), row('policies', Object.keys(profile.properties ?? {}).filter((key) => key.endsWith('_qos')).length)]; }
function simpleName(value) { return value?.split('::').pop(); }
function findStruct(model, name) { return elementsOf(model, 'Struct').find((item) => item.name === simpleName(name)); }
function findType(model, name) { return typeElements(model).find((item) => item.name === simpleName(name)); }
function hasProfile(topic, profile) { return topic.properties?.topic_qos?.base_name?.endsWith(`::${profile.name}`); }
function focusedProfile(model, profiles, selectedId) { let item = model?.elementsById?.[selectedId]; while (item) { if (item.type === 'QosProfile') return item; if (item.type === 'Topic') return profiles.find((profile) => hasProfile(item, profile)); item = model.elementsById[item.parentId]; } return null; }
function pushTopicEdge(edges, topics, source, topicName, label) { const topic = topics.find((item) => item.name === topicName); if (topic) edges.push(edge(source, topic.id, label, `qos-edge qos-edge--${label === 'writes' ? 'datawriter' : 'datareader'}`)); }
function editableRows(value, profileId, entityKey) { return flatten(value, '', { profileId, entityKey }); }
function flatten(value, prefix, meta) { if (!value || typeof value !== 'object') return []; return Object.entries(value).flatMap(([key, child]) => { if (key === 'name' || key === 'topic_filter') return []; const path = prefix ? `${prefix}.${key}` : key; if (child && typeof child === 'object' && !Array.isArray(child)) return flatten(child, path, meta); return [{ key: path, value: Array.isArray(child) ? child.join(', ') : child, editable: true, ...meta }]; }); }
