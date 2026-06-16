function mapType(type) {
  const typeMap = {
    float32: 'float',
    float64: 'double',
    int32: 'long',
    uint32: 'unsigned long',
    boolean: 'boolean',
    string: 'string',
  };

  return typeMap[type] || type;
}

export function generateIdl(model) {
  const structs = Object.values(model.elementsById).filter((element) => element.type === 'Struct');

  return structs
    .map((struct) => {
      const members = struct.properties.members || [];
      const body = members.map((member) => `  ${mapType(member.type)} ${member.name};`).join('\n');
      return `struct ${struct.name} {\n${body}\n};`;
    })
    .join('\n\n');
}
