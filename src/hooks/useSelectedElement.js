import { useDesignerStore } from '../stores/useDesignerStore.js';

export function useSelectedElement() {
  const model = useDesignerStore((state) => state.model);
  const selectedElementId = useDesignerStore((state) => state.selectedElementId);
  const selectElement = useDesignerStore((state) => state.selectElement);
  const updateElement = useDesignerStore((state) => state.updateElement);
  const updateProperty = useDesignerStore((state) => state.updateProperty);

  const element = selectedElementId && model
    ? model.elementsById[selectedElementId]
    : null;

  return {
    model,
    element,
    selectedElementId,
    selectElement,
    updateElement,
    updateProperty,
  };
}
