import { useSelectedElement } from './useSelectedElement.js';

export function useSelectedQosXml() {
  const { element, updateProperty } = useSelectedElement();
  const qosXml = element?.properties?.qosXml;

  const updateQosXml = (nextValue) => {
    if (!element) return;
    updateProperty(element.id, 'qosXml', nextValue);
  };

  return {
    element,
    qosXml,
    hasElement: Boolean(element),
    hasQosXml: typeof qosXml === 'string',
    updateQosXml,
  };
}
