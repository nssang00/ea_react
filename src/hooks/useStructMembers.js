import { useDesignerStore } from '../stores/useDesignerStore.js';
import { useSelectedElement } from './useSelectedElement.js';

export function useStructMembers(elementId) {
  const { element } = useSelectedElement();
  const model = useDesignerStore((state) => state.model);
  const updateMembers = useDesignerStore((state) => state.updateMembers);
  const targetElement = elementId && model
    ? model.elementsById[elementId]
    : element;

  return {
    element: targetElement,
    members: targetElement?.properties?.members,
    updateMembers,
  };
}
