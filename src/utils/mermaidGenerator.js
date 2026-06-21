export function generateMermaid(model) {
  const elements = Object.values(model.elementsById);
  const structs = elements.filter((element) => element.type === 'Struct');
  const topics = elements.filter((element) => element.type === 'Topic');
  const qosProfiles = elements.filter((element) => element.type === 'QosProfile');
  const lines = ['classDiagram'];

  structs.forEach((struct) => {
    lines.push(`  class ${sanitizeMermaidId(struct.name)} {`);

    const members = struct.properties?.members ?? [];
    members.forEach((member) => {
      lines.push(`    ${formatMemberType(member)} ${member.name}`);
    });

    lines.push('  }');
  });

  topics.forEach((topic) => {
    const topicId = sanitizeMermaidId(topic.name);
    const dataType = topic.properties?.register_type_ref || topic.properties?.dataType;
    const qosProfile = topic.properties?.topic_qos?.base_name || topic.properties?.qosProfile;

    lines.push(`  class ${topicId} {`);
    lines.push('    <<Topic>>');
    if (dataType) lines.push(`    dataType ${dataType}`);
    if (qosProfile) lines.push(`    qosProfile ${qosProfile}`);
    lines.push('  }');

    if (dataType) {
      lines.push(`  ${topicId} --> ${sanitizeMermaidId(dataType)} : dataType`);
    }
  });

  qosProfiles.forEach((qosProfile) => {
    const qosId = sanitizeMermaidId(qosProfile.name);

    lines.push(`  class ${qosId} {`);
    lines.push('    <<QoS>>');
    if (qosProfile.properties?.reliability) {
      lines.push(`    reliability ${qosProfile.properties.reliability}`);
    }
    if (qosProfile.properties?.durability) {
      lines.push(`    durability ${qosProfile.properties.durability}`);
    }
    lines.push('  }');
  });

  return lines.join('\n');
}

function formatMemberType(member) {
  if (member.kind === 'array') {
    return `${member.type}[${(member.array_dimensions || []).join('][')}]`;
  }

  if (member.kind === 'sequence') {
    const bound = member.sequence_max_length ? `, ${member.sequence_max_length}` : '';
    return `sequence<${member.type}${bound}>`;
  }

  if (member.kind === 'string' || member.kind === 'wstring') {
    return member.string_max_length ? `${member.kind}<${member.string_max_length}>` : member.kind;
  }

  return member.type || member.kind;
}

function sanitizeMermaidId(value) {
  return String(value).replace(/[^a-zA-Z0-9_]/g, '_');
}
