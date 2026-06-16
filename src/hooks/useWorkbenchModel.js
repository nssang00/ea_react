import { useDesignerStore } from '../stores/useDesignerStore.js';

export function useWorkbenchModel() {
  const model = useDesignerStore((state) => state.model);
  const modelProjectId = useDesignerStore((state) => state.modelProjectId);
  const dirty = useDesignerStore((state) => state.dirty);
  const selectedElementId = useDesignerStore((state) => state.selectedElementId);
  const selectElement = useDesignerStore((state) => state.selectElement);

  return {
    model,
    modelProjectId,
    dirty,
    selectedElementId,
    selectElement,
  };
}
