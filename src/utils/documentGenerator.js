export function generateModelSummary(model) {
  const elements = Object.values(model.elementsById);
  return {
    topics: elements.filter((element) => element.type === 'Topic').length,
    structs: elements.filter((element) => element.type === 'Struct').length,
    qosProfiles: elements.filter((element) => element.type === 'QosProfile').length,
  };
}
