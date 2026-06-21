function mapType(type) {
  const typeMap = {
    int8: 'int8',
    int16: 'short',
    int64: 'long long',
    uint8: 'octet',
    uint16: 'unsigned short',
    uint64: 'unsigned long long',
    float32: 'float',
    float64: 'double',
    int32: 'long',
    uint32: 'unsigned long',
    boolean: 'boolean',
    string: 'string',
  };

  return typeMap[type] || type;
}

function memberType(member) {
  if (member.kind === 'string' || member.kind === 'wstring') {
    const bound = member.string_max_length ? `<${member.string_max_length}>` : '';
    return `${member.kind}${bound}`;
  }

  if (member.kind === 'sequence') {
    const bound = member.sequence_max_length ? `, ${member.sequence_max_length}` : '';
    return `sequence<${mapType(member.type)}${bound}>`;
  }

  if (member.kind === 'array') {
    return mapType(member.type);
  }

  return mapType(member.type || member.kind);
}

function memberName(member) {
  if (member.kind !== 'array') return member.name;

  const dimensions = (member.array_dimensions || []).map((size) => `[${size}]`).join('');
  return `${member.name}${dimensions}`;
}

export function generateIdl(model) {
  const structs = Object.values(model.elementsById).filter((element) => element.type === 'Struct');

  return structs
    .map((struct) => {
      const members = struct.properties.members || [];
      const body = members.map((member) => `  ${memberType(member)} ${memberName(member)};`).join('\n');
      return `struct ${struct.name} {\n${body}\n};`;
    })
    .join('\n\n');
}
