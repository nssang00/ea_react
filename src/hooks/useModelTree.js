import { useMemo } from 'react';
import { useWorkbenchModel } from './useWorkbenchModel.js';

export function useModelTree() {
  const { model, selectedElementId, selectElement } = useWorkbenchModel();
  const elementsById = model?.elementsById;

  const treeData = useMemo(() => {
    return buildTreeData(elementsById);
  }, [elementsById]);

  return {
    treeData,
    selectedKeys: selectedElementId ? [selectedElementId] : [],
    hasModel: Boolean(model),
    selectElement,
  };
}

function buildTreeData(elementsById) {
  if (!elementsById) return [];

  const childrenMap = new Map();

  Object.values(elementsById).forEach((element) => {
    const parentId = element.parentId ?? '__root__';

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }

    childrenMap.get(parentId).push(element);
  });

  function buildNode(element) {
    const children = childrenMap.get(element.id) ?? [];

    return {
      key: element.id,
      title: element.name,
      children: children.map(buildNode),
    };
  }

  return (childrenMap.get('__root__') ?? []).map(buildNode);
}
