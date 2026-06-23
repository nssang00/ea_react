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
  const modules = elementsOf(model, 'Module');
  const types = typeElements(model);
  const nodes = [];
  const edges = [];
  let y = 40;

  modules.forEach((module) => {
    const children = types.filter((item) => item.parentId === module.id);
    if (!children.length) return;
    const rows = Math.ceil(children.length / 2);
    const height = Math.max(220, rows * 190 + 70);
    nodes.push(containerNode(`group-${module.id}`, module.name, 40, y, 660, height));
    children.forEach((item, index) => nodes.push(typeNode(item, 90 + (index % 2) * 300, y + 50 + Math.floor(index / 2) * 180)));
    y += height + 40;
  });

  const containedIds = new Set(nodes.map((node) => node.data?.selectId).filter(Boolean));
  types.filter((item) => !containedIds.has(item.id)).forEach((item, index) => {
    nodes.push(typeNode(item, 760, 80 + index * 180));
  });

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
  const fallbackRows = {
    domain_participant_qos: [row('name', participant?.name ?? 'DomainParticipant'), row('domain', participant?.properties?.domain_ref)],
    topic_qos: [row('topic', topic?.name ?? 'Topic'), row('type', topic?.properties?.register_type_ref)],
    publisher_qos: [row('name', publisher?.name ?? 'Publisher'), row('writers', publisher?.data_writers?.length ?? 0)],
    subscriber_qos: [row('name', subscriber?.name ?? 'Subscriber'), row('readers', subscriber?.data_readers?.length ?? 0)],
    datawriter_qos: [row('writer', writer?.name ?? 'DataWriter'), row('topic', writer?.topic_ref ?? topic?.name)],
    datareader_qos: [row('reader', reader?.name ?? 'DataReader'), row('topic', reader?.topic_ref ?? topic?.name)],
  };
  const specs = [
    ['domain_participant_qos', 'participant', 'DomainParticipant QoS', 560, 40],
    ['topic_qos', 'topic', 'Topic QoS', 560, 260],
    ['publisher_qos', 'publisher', 'Publisher QoS', 560, 480],
    ['subscriber_qos', 'subscriber', 'Subscriber QoS', 940, 40],
    ['datawriter_qos', 'datawriter', 'DataWriter QoS', 940, 260],
    ['datareader_qos', 'datareader', 'DataReader QoS', 940, 480],
  ];
  const nodes = [
    entityNode(`${profile.id}-library`, 'library', 'QoS Library', 'DDS QoS Library', 40, 300,
      [row('profile', profile.name), row('scope', model?.ddsJson?.qos?.qos_library?.name ?? 'qos_library')], profile.id),
    entityNode(profile.id, 'profile', 'QoS Profile', profile.name, 300, 300, profileRows(profile), profile.id),
    ...specs.map(([key, kind, title, x, y]) => {
      const policies = editableRows(profile.properties?.[key], profile.id, key);
      return entityNode(`${profile.id}-${key}`, kind, title, key.replace(/_qos$/, '').replace(/_/g, ' '), x, y,
        policies.length ? policies : fallbackRows[key], profile.id);
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
  const topics = elementsOf(model, 'Topic');
  const structs = elementsOf(model, 'Struct');
  const nodes = [];
  const edges = [];
  const registrationIds = new Map();

  domains.forEach((domain, index) => {
    nodes.push(entityNode(domain.id, 'domain', 'Domain', domain.name, 80, 120 + index * 260, domainRows(domain), domain.id));
    (domain.properties?.register_types ?? []).forEach((registration, registrationIndex) => {
      const id = `register-type-${domain.id}-${registrationIndex}`;
      registrationIds.set(`${domain.id}:${registration.name}`, id);
      nodes.push(entityNode(id, 'registerType', registration.name, 'Registered Type', 370, 80 + index * 260 + registrationIndex * 120,
        [row('name', registration.name), row('type_ref', registration.type_ref)], findStruct(model, registration.type_ref)?.id));
      edges.push(edge(domain.id, id, 'registers', 'qos-edge qos-edge--domain'));
    });
  });
  topics.forEach((topic, index) => {
    nodes.push(entityNode(topic.id, 'topic', 'Topic', topic.name, 660, 80 + index * 150, topicRows(topic), topic.id));
    const registrationId = registrationIds.get(`${topic.parentId}:${topic.properties?.register_type_ref}`);
    if (registrationId) edges.push(edge(registrationId, topic.id, 'topic', 'qos-edge qos-edge--registerType'));
    const target = structs.find((item) => item.name === simpleName(topic.properties?.register_type_ref));
    if (target) edges.push(edge(topic.id, target.id, 'type', 'qos-edge qos-edge--topic'));
  });
  structs.forEach((item, index) => nodes.push(typeNode(item, 960, 80 + index * 180)));
  return { nodes, edges };
}

export function buildParticipantDiagram(model) {
  const participants = elementsOf(model, 'DomainParticipant');
  const topics = elementsOf(model, 'Topic');
  const nodes = topics.map((item, index) => entityNode(item.id, 'topic', 'Topic', item.name, 1010, 100 + index * 140, topicRows(item), item.id));
  const edges = [];
  participants.forEach((participant, participantIndex) => {
    const baseY = 160 + participantIndex * 320;
    nodes.push(entityNode(participant.id, 'participant', 'DomainParticipant', participant.name, 80, baseY, participantRows(participant), participant.id));
    (participant.properties?.publishers ?? []).forEach((publisher, index) => {
      const publisherId = `${participant.id}-publisher-${publisher.name}`;
      nodes.push(entityNode(publisherId, 'publisher', 'Publisher', publisher.name, 390, baseY - 80 + index * 150, [row('writers', publisher.data_writers?.length ?? 0)], participant.id));
      edges.push(edge(participant.id, publisherId, 'publisher', 'qos-edge qos-edge--participant'));
      (publisher.data_writers ?? []).forEach((writer, writerIndex) => {
        const id = `${participant.id}-writer-${writer.name}`;
        nodes.push(entityNode(id, 'datawriter', 'DataWriter', writer.name, 700, baseY - 90 + index * 150 + writerIndex * 120, [row('topic_ref', writer.topic_ref)], participant.id));
        edges.push(edge(publisherId, id, 'writer', 'qos-edge qos-edge--publisher'));
        pushTopicEdge(edges, topics, id, writer.topic_ref, 'writes');
      });
    });
    (participant.properties?.subscribers ?? []).forEach((subscriber, index) => {
      const subscriberId = `${participant.id}-subscriber-${subscriber.name}`;
      nodes.push(entityNode(subscriberId, 'subscriber', 'Subscriber', subscriber.name, 390, baseY + 70 + index * 150, [row('readers', subscriber.data_readers?.length ?? 0)], participant.id));
      edges.push(edge(participant.id, subscriberId, 'subscriber', 'qos-edge qos-edge--participant'));
      (subscriber.data_readers ?? []).forEach((reader, readerIndex) => {
        const id = `${participant.id}-reader-${reader.name}`;
        nodes.push(entityNode(id, 'datareader', 'DataReader', reader.name, 700, baseY + 60 + index * 150 + readerIndex * 120, [row('topic_ref', reader.topic_ref)], participant.id));
        edges.push(edge(subscriberId, id, 'reader', 'qos-edge qos-edge--subscriber'));
        pushTopicEdge(edges, topics, id, reader.topic_ref, 'reads');
      });
    });
  });
  return { nodes, edges };
}

function typeNode(item, x, y) { return entityNode(item.id, variant(item.type), item.type, item.name, x, y, typeRows(item), item.id); }
function entityNode(id, kind, label, subtitle, x, y, fields, selectId) {
  const visibleFields = fields.filter((item) => item.value !== undefined);
  return { id, nodeType: 'qosNode', position: { x, y }, width: kind === 'library' || kind === 'profile' ? 220 : 310,
    height: Math.max(132, 76 + visibleFields.length * 29), data: { label, type: subtitle, variant: kind, selectId, fields: visibleFields } };
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
