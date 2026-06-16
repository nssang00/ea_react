import { getMockModel } from './mockData.js';

export async function fetchProjectModel(projectId) {
  const model = getMockModel(projectId);
  return cloneData(model);
}

function cloneData(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}
