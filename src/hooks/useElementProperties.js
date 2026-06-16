import { useMemo } from 'react';
import { useSelectedElement } from './useSelectedElement.js';

export function useElementProperties() {
  const { element, updateElement, updateProperty } = useSelectedElement();

  const propertyGroups = useMemo(() => {
    const editableProperties = Object.entries(element?.properties || {})
      .filter(([, value]) => !Array.isArray(value));

    return {
      editorProperties: editableProperties.filter(([key]) => key === 'qosXml'),
      formProperties: editableProperties.filter(([key]) => key !== 'qosXml'),
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
