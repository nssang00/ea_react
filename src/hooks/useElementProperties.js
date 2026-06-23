import { useMemo } from 'react';
import { useSelectedElement } from './useSelectedElement.js';

export function useElementProperties() {
  const { model, element, updateElement, updateProperty, updateQosPath } = useSelectedElement();

  const propertyGroups = useMemo(() => {
    const isQosElement = ['QosProfile', 'QosPolicy', 'QosValue'].includes(element?.type);
    const editableProperties = Object.entries(element?.properties || {})
      .filter(([key, value]) => key !== 'members' && !Array.isArray(value) && typeof value !== 'object');

    return {
      editorProperties: isQosElement ? [] : Object.entries(element?.properties || {}).filter(([key]) => key === 'qosJson'),
      formProperties: isQosElement ? [] : editableProperties,
      hasMembers: Array.isArray(element?.properties?.members),
      members: element?.properties?.members,
      qosFields: isQosElement ? buildQosFields(model, element) : [],
    };
  }, [element, model]);

  return {
    model,
    element,
    updateElement,
    updateProperty,
    updateQosPath,
    ...propertyGroups,
  };
}

function buildQosFields(model, element) {
  const profile = findQosProfile(model, element);
  if (!profile) return [];
  const policyPath = element.type === 'QosProfile' ? '' : element.properties?.policyPath ?? '';
  const source = policyPath ? readPath(profile.properties, policyPath) : qosSections(profile.properties);
  return flattenFields(source, policyPath);
}

function findQosProfile(model, element) {
  let current = element;
  while (current) {
    if (current.type === 'QosProfile') return current;
    current = model.elementsById[current.parentId];
  }
  return null;
}

function qosSections(properties) {
  return Object.fromEntries(Object.entries(properties).filter(([key, value]) => key.endsWith('_qos') && value && typeof value === 'object'));
}

function readPath(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

function flattenFields(value, prefix = '') {
  if (!value || typeof value !== 'object') return prefix ? [{ path: prefix, value }] : [];
  if (Array.isArray(value)) return [{ path: prefix, value }];
  return Object.entries(value).flatMap(([key, child]) => flattenFields(child, prefix ? `${prefix}.${key}` : key));
}
