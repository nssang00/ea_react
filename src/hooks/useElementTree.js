import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';

export function useElementTree(types) {
  const { model, selectedElementId, selectElement } = useWorkbenchModel();
  const typeSet = useMemo(() => new Set(types), [types]);

  const treeData = useMemo(() => {
    if (!model) return [];

    const elements = Object.values(model.elementsById)
      .filter((element) => typeSet.has(element.type));

    return elements.map((element) => ({
      key: element.id,
      title: element.name,
      children: elements
        .filter((child) => child.parentId === element.id)
        .map((child) => ({
          key: child.id,
          title: child.name,
        })),
    })).filter((element) => {
      const source = model.elementsById[element.key];
      return !typeSet.has(model.elementsById[source.parentId]?.type);
    });
  }, [model, typeSet]);

  return {
    treeData,
    selectedKeys: selectedElementId ? [selectedElementId] : [],
    hasModel: Boolean(model),
    selectElement,
  };
}
