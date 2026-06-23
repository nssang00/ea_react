// Converts raw DDS-JSON files (types, domains, qos, domainParticipants) into the
// internal model shape: { ddsJson, elementsById, diagram }.

export function ddsJsonToModel(ddsJson) {
  const elementsById = {};

  buildTypeElements(ddsJson.types, elementsById);
  buildDomainElements(ddsJson.domains, elementsById);
  buildQosElements(ddsJson.qos, elementsById);
  buildParticipantElements(ddsJson.domainParticipants, elementsById);

  return {
    ddsJson,
    elementsById,
    diagram: { nodes: [], edges: [] },
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

function buildTypeElements(typesJson, elementsById) {
  if (!typesJson) return;

  for (const [key, value] of Object.entries(typesJson)) {
    if (!isPlainObject(value)) continue;

    if (value.kind === 'module') {
      const moduleId = `module-${key}`;
      elementsById[moduleId] = {
        id: moduleId,
        name: key,
        type: 'Module',
        parentId: null,
        properties: { kind: 'module' },
      };
      buildTypeChildElements(value, moduleId, key, elementsById);
    } else {
      const typeId = `type-${slugify(key)}`;
      elementsById[typeId] = makeTypeElement(typeId, key, null, value);
    }
  }
}

function buildTypeChildElements(moduleValue, moduleId, moduleName, elementsById) {
  for (const [key, value] of Object.entries(moduleValue)) {
    if (key === 'kind' || key === 'annotations') continue;
    if (!isPlainObject(value)) continue;

    const qualifiedName = `${moduleName}::${key}`;

    if (value.kind === 'module') {
      const childModuleId = `module-${slugify(qualifiedName)}`;
      elementsById[childModuleId] = {
        id: childModuleId,
        name: key,
        type: 'Module',
        parentId: moduleId,
        properties: { kind: 'module' },
      };
      buildTypeChildElements(value, childModuleId, qualifiedName, elementsById);
    } else {
      const typeId = `type-${slugify(qualifiedName)}`;
      elementsById[typeId] = makeTypeElement(typeId, key, moduleId, value);
    }
  }
}

function makeTypeElement(id, name, parentId, props) {
  const kind = props.kind ?? 'struct';
  const typeMap = {
    struct: 'Struct',
    union: 'Union',
    enum: 'Enum',
    bitmask: 'Bitmask',
    typedef: 'Typedef',
    annotation: 'Annotation',
    const: 'Const',
    module: 'Module',
  };

  return {
    id,
    name,
    type: typeMap[kind] ?? 'Struct',
    parentId,
    properties: props,
  };
}

// ─── Domains ─────────────────────────────────────────────────────────────────

function buildDomainElements(domainsJson, elementsById) {
  const library = domainsJson?.domain_library;
  if (!library) return;

  const libraryId = `domain-library-${slugify(library.name ?? 'default')}`;
  elementsById[libraryId] = {
    id: libraryId,
    name: library.name ?? 'DomainLibrary',
    type: 'DomainLibrary',
    parentId: null,
    properties: { name: library.name },
  };

  for (const domain of library.domains ?? []) {
    const domainId = `domain-${slugify(domain.name)}`;
    elementsById[domainId] = {
      id: domainId,
      name: domain.name,
      type: 'Domain',
      parentId: libraryId,
      properties: domain,
    };

    for (const topic of domain.topics ?? []) {
      const topicId = `topic-${slugify(domain.name)}-${slugify(topic.name)}`;
      elementsById[topicId] = {
        id: topicId,
        name: topic.name,
        type: 'Topic',
        parentId: domainId,
        properties: topic,
      };
    }
  }
}

// ─── QoS ─────────────────────────────────────────────────────────────────────

function buildQosElements(qosJson, elementsById) {
  const library = qosJson?.qos_library;
  if (!library) return;

  const libraryId = `qos-library-${slugify(library.name ?? 'default')}`;
  elementsById[libraryId] = {
    id: libraryId,
    name: library.name ?? 'QosLibrary',
    type: 'QosLibrary',
    parentId: null,
    properties: { name: library.name },
  };

  for (const profile of library.qos_profiles ?? []) {
    const profileId = `qos-profile-${slugify(library.name ?? 'lib')}-${slugify(profile.name)}`;
    elementsById[profileId] = {
      id: profileId,
      name: profile.name,
      type: 'QosProfile',
      parentId: libraryId,
      properties: {
        ...profile,
        qosJson: JSON.stringify(profile, null, 2),
      },
    };

    collectQosPolicyElements(elementsById, profileId, profile);
  }
}

function collectQosPolicyElements(elementsById, profileId, profile) {
  for (const [key, value] of Object.entries(profile)) {
    if (!key.endsWith('_qos') || !isPlainObject(value)) continue;

    collectQosPolicyTree(elementsById, profileId, profileId, [key], value);
  }
}

function collectQosPolicyTree(elementsById, profileId, parentId, path, value) {
  const id = `${profileId}-${path.map(slugify).join('-')}`;
  const name = path.at(-1);

  elementsById[id] = {
    id,
    name,
    type: 'QosPolicy',
    parentId,
    properties: {
      policyPath: path.join('.'),
      qosJson: JSON.stringify(value, null, 2),
      ...primitiveEntries(value),
    },
  };

  for (const [key, childValue] of Object.entries(value)) {
    if (isPlainObject(childValue)) {
      collectQosPolicyTree(elementsById, profileId, id, [...path, key], childValue);
    } else {
      const childId = `${id}-${slugify(key)}`;
      elementsById[childId] = {
        id: childId,
        name: key,
        type: 'QosValue',
        parentId: id,
        properties: { policyPath: [...path, key].join('.'), value: childValue },
      };
    }
  }
}

// ─── DomainParticipants ───────────────────────────────────────────────────────

function buildParticipantElements(participantsJson, elementsById) {
  const library = participantsJson?.domain_participant_library;
  if (!library) return;

  const libraryId = `participant-library-${slugify(library.name ?? 'default')}`;
  elementsById[libraryId] = {
    id: libraryId,
    name: library.name ?? 'ParticipantLibrary',
    type: 'ParticipantLibrary',
    parentId: null,
    properties: { name: library.name },
  };

  for (const participant of library.domain_participants ?? []) {
    const participantId = `participant-${slugify(participant.name)}`;
    elementsById[participantId] = {
      id: participantId,
      name: participant.name,
      type: 'DomainParticipant',
      parentId: libraryId,
      properties: participant,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function primitiveEntries(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => !isPlainObject(v) && !Array.isArray(v))
  );
}

function slugify(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
