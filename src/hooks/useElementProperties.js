import { useMemo } from 'react';
import { useSelectedElement } from './useSelectedElement.js';

export function useElementProperties() {
  const { element, updateElement, updateProperty } = useSelectedElement();

  const propertyGroups = useMemo(() => {
    const editableProperties = Object.entries(element?.properties || {})
      .filter(([key, value]) => key !== 'members' && !Array.isArray(value) && typeof value !== 'object');

    return {
      editorProperties: Object.entries(element?.properties || {})
        .filter(([key]) => key === 'qosJson'),
      formProperties: editableProperties,
      hasMembers: Array.isArray(element?.properties?.members),
      members: element?.properties?.members,
    };
  }, [element]);

  return {
    element,
    updateElement,
    updateProperty,
    ...propertyGroups,
  };
}
