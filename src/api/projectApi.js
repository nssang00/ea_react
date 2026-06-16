import { mockProjects } from './mockData.js';

export async function fetchProjects() {
  return cloneData(mockProjects);
}

function cloneData(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}
